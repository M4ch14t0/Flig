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

import redisService from '../services/redis.js';
import * as uuidUtils from '../utils/uuid.js';
import connection from '../config/db.js';

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
    this.created_at = data.created_at ? new Date(data.created_at) : new Date();
    this.updated_at = data.updated_at ? new Date(data.updated_at) : new Date();
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
      queue.tempo_estimado, queue.created_at.toISOString().slice(0, 19).replace('T', ' '), queue.updated_at.toISOString().slice(0, 19).replace('T', ' ')
    ];
    
    console.log('🔍 SQL Values:', values);
    console.log('🔍 Created at:', queue.created_at, typeof queue.created_at);
    console.log('🔍 Updated at:', queue.updated_at, typeof queue.updated_at);

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

    // Calcular posição única baseada no tamanho atual da fila + 1
    // Isso garante posições sequenciais sem duplicatas
    const position = queueClients.length + 1;

    console.log(`🔍 Adicionando cliente ${clientData.nome} na posição ${position} (total clientes: ${queueClients.length})`);

    await redisService.addClientToQueue(this.id, position, clientWithId);

    console.log(`✅ Cliente adicionado à fila ${this.nome}: ${clientData.nome} (Posição: ${position})`);
    return { success: true, clientId, position, estimatedTime: this.calculateEstimatedTime(position) };
  }

  /** Adiciona grupo à fila com validação de capacidade */
  async addGroup(groupData) {
    if (this.status !== 'ativa') throw new Error('Fila não está ativa');

    // Validar se o grupo pode entrar baseado na capacidade máxima
    const groupSize = groupData.members.length + 1; // +1 para o líder
    const maxCapacity = this.getMaxTableCapacity();
    if (groupSize > maxCapacity) {
      throw new Error(`Grupo muito grande. Máximo permitido: ${maxCapacity} pessoas. Considere fazer uma reserva.`);
    }

    let queueClients = await redisService.getQueueClients(this.id);
    if (!Array.isArray(queueClients)) queueClients = [];

    // Verificar se algum membro já está na fila
    const allEmails = [groupData.leader.email, ...groupData.members.map(m => m.email)];
    const allPhones = [groupData.leader.telefone, ...groupData.members.map(m => m.telefone)];
    
    const isDuplicate = queueClients.some((existingClient) => {
      return allEmails.includes(existingClient.email) || 
             allPhones.includes(existingClient.telefone);
    });

    if (isDuplicate) throw new Error('Algum membro do grupo já está nesta fila');

    const groupId = uuidUtils.generateGroupId();
    const leaderId = uuidUtils.generateClientId();
    
    // Criar dados do líder do grupo
    const leaderData = {
      ...groupData.leader,
      id: leaderId,
      groupId: groupId,
      isGroupLeader: true,
      groupMembers: groupData.members,
      groupSize: groupSize,
      tipo: 'grupo',
      timestamp: new Date().toISOString()
    };

    // Calcular posição única
    const position = queueClients.length + 1;

    console.log(`🔍 Adicionando grupo ${leaderData.nome} na posição ${position} (${groupSize} pessoas)`);

    await redisService.addClientToQueue(this.id, position, leaderData);

    console.log(`✅ Grupo adicionado à fila ${this.nome}: ${leaderData.nome} + ${groupData.members.length} membros (Posição: ${position})`);
    
    return { 
      success: true, 
      clientId: leaderId, 
      groupId: groupId,
      position, 
      estimatedTime: this.calculateEstimatedTime(position),
      groupSize: groupSize
    };
  }

  /** Obtém a capacidade máxima de mesa disponível */
  getMaxTableCapacity() {
    // Por padrão, máximo de 8 pessoas
    // Isso pode ser configurado por estabelecimento
    return this.max_table_capacity || 8;
  }

  /** Define os tipos de mesas disponíveis */
  setTableTypes(tableTypes) {
    this.table_types = tableTypes;
    this.max_table_capacity = Math.max(...Object.keys(tableTypes).map(Number));
  }

  /** Verifica se um grupo pode entrar na fila */
  canGroupEnter(groupSize) {
    const maxCapacity = this.getMaxTableCapacity();
    return groupSize <= maxCapacity;
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
    
    // Buscar média real do banco de dados
    let averageWaitTime = 0;
    try {
      const { pool } = require('../config/database');
      const [rows] = await pool.execute(
        `SELECT tempo_medio_espera, total_atendidos_tempo 
         FROM filas 
         WHERE id = ?`,
        [this.id]
      );
      
      console.log(`📊 getStats() - Fila ${this.nome}:`, {
        queueSize,
        dbRows: rows,
        totalAtendidos: rows[0]?.total_atendidos_tempo,
        tempoMedio: rows[0]?.tempo_medio_espera
      });
      
      if (rows.length > 0 && rows[0].total_atendidos_tempo > 0) {
        // Usar média real se há dados históricos
        averageWaitTime = parseFloat(rows[0].tempo_medio_espera) || 0;
        console.log(`✅ Usando média REAL: ${averageWaitTime} min`);
      } else {
        // Se não há dados históricos, usar estimativa baseada na posição
        averageWaitTime = queueSize > 0 ? (queueSize - 1) * this.tempo_estimado : 0;
        console.log(`⚠️ Usando ESTIMATIVA: ${averageWaitTime} min`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar média real, usando estimativa:', error.message);
      // Fallback para estimativa
      averageWaitTime = queueSize > 0 ? (queueSize - 1) * this.tempo_estimado : 0;
    }
    
    return {
      totalClients: queueSize,
      averageWaitTime: averageWaitTime,
      status: this.status,
      createdAt: this.created_at,
      lastUpdated: this.updated_at
    };
  }

  /** Avança cliente na fila (método legado - mantido para compatibilidade) */
  async advanceClient(clientId, positions) {
    console.log(`🔍 advanceClient - clientId: ${clientId}, positions: ${positions}`);
    
    if (this.status !== 'ativa') {
      throw new Error('Fila não está ativa');
    }

    if (positions < 1 || positions > this.max_avancos) {
      throw new Error(`Número de posições deve estar entre 1 e ${this.max_avancos}`);
    }

    // Buscar clientes atuais
    const clients = await redisService.getQueueClients(this.id);
    console.log(`🔍 Clientes encontrados: ${clients.length}`);
    console.log(`🔍 Clientes:`, clients.map(c => ({ id: c.id, nome: c.nome, position: c.position })));
    
    if (!Array.isArray(clients)) {
      throw new Error('Erro ao buscar clientes da fila');
    }

    // Encontrar o cliente - comparação mais robusta
    const clientIndex = clients.findIndex(client => {
      // Compara tanto string quanto número para garantir compatibilidade
      return client.id === clientId || client.id === String(clientId);
    });
    console.log(`🔍 Cliente encontrado no índice: ${clientIndex}`);
    console.log(`🔍 Buscando clientId: ${clientId}, tipo: ${typeof clientId}`);
    console.log(`🔍 Clientes disponíveis:`, clients.map(c => ({ id: c.id, nome: c.nome, tipo: typeof c.id })));
    
    if (clientIndex === -1) {
      throw new Error('Cliente não encontrado na fila');
    }

    const client = clients[clientIndex];
    const oldPosition = client.position || (clientIndex + 1);
    const newPosition = Math.max(1, oldPosition - positions);

    // Verificar se pode avançar
    if (newPosition >= oldPosition) {
      throw new Error('Não é possível avançar para uma posição igual ou superior à atual');
    }

    console.log(`🔍 Movendo cliente ${client.nome} da posição ${oldPosition} para ${newPosition}`);

    // LÓGICA SIMPLES: Usar Redis ZSET nativo
    // O Redis ZSET automaticamente reorganiza quando você muda o score
    // 1. Atualizar o score (posição) do cliente no Redis
    // 2. O Redis automaticamente reorganiza a fila
    
    // Usar a função moveClientInQueue que já existe no redisService
    await redisService.moveClientInQueue(this.id, client, newPosition);
    
    // Buscar clientes atualizados do Redis
    const newClients = await redisService.getQueueClients(this.id);

    console.log(`🔍 Posições após reorganização:`, newClients.map(c => ({ nome: c.nome, position: c.position })));

    // Calcular tempo estimado
    const estimatedTime = (newPosition - 1) * this.tempo_estimado;

    return {
      oldPosition,
      newPosition,
      positionsAdvanced: oldPosition - newPosition,
      estimatedTime
    };
  }

  /** Avança cliente verticalmente (sistema de aluguel de posição) */
  async advanceClientVertically(clientId, positions) {
    console.log(`🔍 advanceClientVertically - clientId: ${clientId}, positions: ${positions}`);
    
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

    // Encontrar o cliente
    const client = clients.find(c => c.id === clientId || c.id === String(clientId));
    if (!client) {
      throw new Error('Cliente não encontrado na fila');
    }

    console.log(`🔍 Avançando cliente ${client.nome} verticalmente ${positions} posições`);

    // Nova lógica: inserção horizontal (sistema de aluguel)
    const result = await redisService.advanceClientWithRental(this.id, client, positions);
    
    return {
      success: true,
      oldPosition: client.position,
      newPosition: result.newPosition,
      positionsAdvanced: result.positionsAdvanced,
      estimatedTime: this.calculateEstimatedTime(result.newPosition)
    };
  }

  /** Avança cliente horizontalmente (prioridade local) */
  async advanceClientHorizontally(clientId, targetPosition) {
    console.log(`🔍 advanceClientHorizontally - clientId: ${clientId}, targetPosition: ${targetPosition}`);
    
    if (this.status !== 'ativa') {
      throw new Error('Fila não está ativa');
    }

    // Buscar clientes atuais
    const clients = await redisService.getQueueClients(this.id);
    if (!Array.isArray(clients)) {
      throw new Error('Erro ao buscar clientes da fila');
    }

    // Encontrar o cliente
    const client = clients.find(c => c.id === clientId || c.id === String(clientId));
    if (!client) {
      throw new Error('Cliente não encontrado na fila');
    }

    console.log(`🔍 Avançando cliente ${client.nome} horizontalmente para posição ${targetPosition}`);

    // Usar nova função de avanço horizontal
    const result = await redisService.advanceClientHorizontally(this.id, client, targetPosition);
    
    return {
      success: true,
      oldPosition: client.position,
      newPosition: result.newPosition,
      subPosition: result.subPosition,
      estimatedTime: this.calculateEstimatedTime(result.newPosition)
    };
  }

  /** Obtém clientes agrupados por posição (exibição bidimensional) */
  async getClientsGrouped() {
    try {
      const groupedClients = await redisService.getQueueClientsGrouped(this.id);
      return groupedClients;
    } catch (error) {
      console.error('❌ Erro ao obter clientes agrupados:', error);
      throw new Error('Falha ao obter clientes agrupados');
    }
  }
}

export default Queue;
