/**
 * Model de Fila para Sistema Flig
 * 
 * Estrutura da Fila:
 * - Redis ZSET: clientes ordenados por posição
 * - Member: dados do cliente
 * - Metadados: informações da fila
 * 
 * @author Flig
 * @version 1.0.2
 */

const redisService = require('../services/redis');
const uuidUtils = require('../utils/uuid');
const connection = require('../config/db');

class Queue {
  constructor(data = {}) {
    this.id = data.id || uuidUtils.generateQueueId();
    this.nome = data.nome || '';
    this.estabelecimento_id = data.estabelecimento_id || null;
    this.descricao = data.descricao || '';
    this.status = data.status || 'ativa';
    this.max_avancos = data.max_avancos || 8;
    this.valor_avancos = data.valor_avancos || 0;
    this.tempo_estimado = data.tempo_estimado || 5;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /** Cria uma nova fila */
  static async create(queueData) {
    const queue = new Queue(queueData);
    const sql = `
      INSERT INTO filas 
      (id, nome, estabelecimento_id, descricao, status, max_avancos, valor_avancos, tempo_estimado, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      queue.id, queue.nome, queue.estabelecimento_id, queue.descricao,
      queue.status, queue.max_avancos, queue.valor_avancos,
      queue.tempo_estimado, queue.created_at, queue.updated_at
    ];

    await new Promise((resolve, reject) =>
      connection.query(sql, values, (err, result) => err ? reject(err) : resolve(result))
    );

    await redisService.setQueueMetadata(queue.id, {
      nome: queue.nome,
      estabelecimento_id: queue.estabelecimento_id,
      descricao: queue.descricao,
      status: queue.status,
      max_avancos: queue.max_avancos,
      valor_avancos: queue.valor_avancos,
      tempo_estimado: queue.tempo_estimado,
      created_at: queue.created_at.toISOString(),
      updated_at: queue.updated_at.toISOString()
    });

    console.log(`✅ Fila criada: ${queue.nome} (ID: ${queue.id})`);
    return queue;
  }

  /** Busca fila por ID */
  static async findById(queueId) {
    const metadata = await redisService.getQueueMetadata(queueId);

    if (!metadata || Object.keys(metadata).length === 0) {
      const sql = 'SELECT * FROM filas WHERE id = ?';
      const result = await new Promise((resolve, reject) =>
        connection.query(sql, [queueId], (err, results) => err ? reject(err) : resolve(results))
      );
      if (!result.length) return null;

      await redisService.setQueueMetadata(queueId, {
        nome: result[0].nome,
        estabelecimento_id: result[0].estabelecimento_id,
        descricao: result[0].descricao,
        status: result[0].status,
        max_avancos: result[0].max_avancos,
        valor_avancos: result[0].valor_avancos,
        tempo_estimado: result[0].tempo_estimado,
        created_at: result[0].created_at,
        updated_at: result[0].updated_at
      });

      return new Queue(result[0]);
    }

    return new Queue({
      id: queueId,
      nome: metadata.nome,
      estabelecimento_id: metadata.estabelecimento_id,
      descricao: metadata.descricao,
      status: metadata.status,
      max_avancos: parseInt(metadata.max_avancos),
      valor_avancos: parseFloat(metadata.valor_avancos),
      tempo_estimado: parseInt(metadata.tempo_estimado),
      created_at: new Date(metadata.created_at),
      updated_at: new Date(metadata.updated_at)
    });
  }

  /** Lista filas de um estabelecimento */
  static async findByEstabelecimento(estabelecimentoId) {
    const sql = 'SELECT * FROM filas WHERE estabelecimento_id = ? AND status != "encerrada" ORDER BY created_at DESC';
    console.log('🔍 Buscando filas para estabelecimento:', estabelecimentoId);
    console.log('📝 SQL:', sql);
    
    const results = await new Promise((resolve, reject) =>
      connection.query(sql, [estabelecimentoId], (err, results) => {
        if (err) {
          console.error('❌ Erro na query:', err);
          reject(err);
        } else {
          console.log('✅ Resultados encontrados:', results.length);
          console.log('📊 Filas:', results.map(r => ({ id: r.id, nome: r.nome, status: r.status })));
          resolve(results);
        }
      })
    );
    return results.map(row => new Queue(row));
  }

  /** Adiciona cliente à fila */
  async addClient(clientData) {
    if (this.status !== 'ativa') throw new Error('Fila não está ativa');

    let queueClients = await redisService.getQueueClients(this.id);
    if (!Array.isArray(queueClients)) queueClients = [];

    const isDuplicate = queueClients.some((existingClient) => {
      return existingClient.email === clientData.email || existingClient.telefone === clientData.telefone;
    });

    if (isDuplicate) throw new Error('Cliente já está nesta fila');

    const clientId = uuidUtils.generateClientId();
    const clientWithId = { ...clientData, id: clientId, timestamp: new Date().toISOString() };

    const position = (await redisService.getQueueSize(this.id)) + 1;
    await redisService.addClientToQueue(this.id, position, clientWithId);

    console.log(`✅ Cliente adicionado à fila ${this.nome}: ${clientData.nome} (Posição: ${position})`);
    return { success: true, clientId, position, estimatedTime: this.calculateEstimatedTime(position) };
  }

  /** Lista clientes da fila */
  async getClients(isEstablishment = false) {
    let clients = await redisService.getQueueClients(this.id);
    if (!Array.isArray(clients)) clients = [];

    // Os clientes já vêm processados do redisService.getQueueClients
    return clients.map(client => {
      return isEstablishment
        ? { id: client.id, nome: client.nome, telefone: client.telefone, email: client.email, position: client.position, timestamp: client.timestamp }
        : { id: client.id, nome: client.nome, position: client.position, timestamp: client.timestamp };
    }).sort((a, b) => a.position - b.position);
  }

  /** Calcula tempo estimado de espera */
  calculateEstimatedTime(position) {
    return (position - 1) * this.tempo_estimado;
  }

  /** Atualiza status da fila */
  async updateStatus(newStatus) {
    this.status = newStatus;
    this.updated_at = new Date();

    const sql = 'UPDATE filas SET status = ?, updated_at = ? WHERE id = ?';
    await new Promise((resolve, reject) =>
      connection.query(sql, [newStatus, this.updated_at, this.id], (err, result) => err ? reject(err) : resolve(result))
    );

    await redisService.setQueueMetadata(this.id, { status: newStatus, updated_at: this.updated_at.toISOString() });
    console.log(`✅ Status da fila ${this.nome} atualizado para: ${newStatus}`);
    return true;
  }

  /** Encerra fila */
  async close() {
    await this.updateStatus('encerrada');
    await redisService.deleteQueue(this.id);
    console.log(`✅ Fila ${this.nome} encerrada e dados limpos do Redis`);
    return true;
  }

  /** Estatísticas da fila */
  async getStats() {
    const queueSize = await redisService.getQueueSize(this.id);
    const clients = await this.getClients(true).catch(() => []);
    return {
      totalClients: queueSize,
      averageWaitTime: queueSize > 0 ? (queueSize * this.tempo_estimado) / 2 : 0,
      status: this.status,
      createdAt: this.created_at,
      lastUpdated: this.updated_at
    };
  }

  /** Avança cliente na fila */
  async advanceClient(clientId, positions) {
    if (this.status !== 'ativa') {
      throw new Error('Fila não está ativa');
    }

    if (positions < 1 || positions > this.max_avancos) {
      throw new Error(`Número de posições deve estar entre 1 e ${this.max_avancos}`);
    }

    // Buscar clientes atuais
    const clients = await redisService.getQueueClients(this.id);
    if (!Array.isArray(clients)) {
      throw new Error('Erro ao buscar clientes da fila');
    }

    // Encontrar o cliente (convertendo clientId para número se necessário)
    const clientIdNum = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;
    const clientIndex = clients.findIndex(client => client.id === clientIdNum);
    if (clientIndex === -1) {
      throw new Error('Cliente não encontrado na fila');
    }

    const client = clients[clientIndex];
    const oldPosition = clientIndex + 1;
    const newPosition = Math.max(1, oldPosition - positions);

    // Verificar se pode avançar
    if (newPosition >= oldPosition) {
      throw new Error('Não é possível avançar para uma posição igual ou superior à atual');
    }

    // Reorganizar a fila
    const newClients = [...clients];
    newClients.splice(clientIndex, 1); // Remove o cliente da posição atual
    newClients.splice(newPosition - 1, 0, client); // Insere na nova posição

    // Atualizar posições
    newClients.forEach((c, index) => {
      c.position = index + 1;
    });

    // Salvar no Redis
    await redisService.setQueueClients(this.id, newClients);

    // Calcular tempo estimado
    const estimatedTime = (newPosition - 1) * this.tempo_estimado;

    return {
      oldPosition,
      newPosition,
      positionsAdvanced: oldPosition - newPosition,
      estimatedTime
    };
  }
}

module.exports = Queue;
