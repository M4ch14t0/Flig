/**
 * Model de Fila para Sistema Flig
 * 
 * Este model define a estrutura e comportamento das filas virtuais,
 * utilizando Redis ZSET para armazenamento em memória e MySQL
 * para persistência de dados históricos.
 * 
 * Estrutura da Fila:
 * - Redis ZSET: armazena clientes ordenados por posição
 * - Score: posição na fila (menor = mais próximo do atendimento)
 * - Member: dados criptografados do cliente
 * - Metadados: informações da fila (nome, estabelecimento, etc.)
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const redisService = require('../services/redis');
const cryptoUtils = require('../utils/crypto');
const uuidUtils = require('../utils/uuid');
const connection = require('../config/db');

class Queue {
  constructor(data = {}) {
    this.id = data.id || uuidUtils.generateQueueId();
    this.nome = data.nome || '';
    this.estabelecimento_id = data.estabelecimento_id || null;
    this.descricao = data.descricao || '';
    this.status = data.status || 'ativa'; // ativa, pausada, encerrada
    this.max_avancos = data.max_avancos || 8; // máximo de avanços por pagamento
    this.valor_avancos = data.valor_avancos || 0; // valor por avanço
    this.tempo_estimado = data.tempo_estimado || 5; // minutos por posição
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Cria uma nova fila no sistema
   * 
   * @param {Object} queueData - Dados da fila
   * @returns {Promise<Queue>} - Instância da fila criada
   */
  static async create(queueData) {
    try {
      const queue = new Queue(queueData);
      
      // Salva no MySQL para persistência
      const sql = `
        INSERT INTO filas 
        (id, nome, estabelecimento_id, descricao, status, max_avancos, valor_avancos, tempo_estimado, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        queue.id,
        queue.nome,
        queue.estabelecimento_id,
        queue.descricao,
        queue.status,
        queue.max_avancos,
        queue.valor_avancos,
        queue.tempo_estimado,
        queue.created_at,
        queue.updated_at
      ];
      
      await new Promise((resolve, reject) => {
        connection.query(sql, values, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      // Define metadados no Redis
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
      
    } catch (error) {
      console.error('❌ Erro ao criar fila:', error);
      throw new Error('Falha ao criar fila');
    }
  }

  /**
   * Busca fila por ID
   * 
   * @param {string} queueId - ID da fila
   * @returns {Promise<Queue|null>} - Instância da fila ou null
   */
  static async findById(queueId) {
    try {
      // Busca metadados no Redis primeiro (mais rápido)
      const metadata = await redisService.getQueueMetadata(queueId);
      
      if (!metadata || Object.keys(metadata).length === 0) {
        // Se não encontrar no Redis, busca no MySQL
        const sql = 'SELECT * FROM filas WHERE id = ?';
        
        const result = await new Promise((resolve, reject) => {
          connection.query(sql, [queueId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        
        if (result.length === 0) {
          return null;
        }
        
        // Recria metadados no Redis se encontrou no MySQL
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
      
      // Converte metadados do Redis para instância da fila
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
      
    } catch (error) {
      console.error('❌ Erro ao buscar fila:', error);
      throw new Error('Falha ao buscar fila');
    }
  }

  /**
   * Lista filas de um estabelecimento
   * 
   * @param {number} estabelecimentoId - ID do estabelecimento
   * @returns {Promise<Array>} - Array de filas
   */
  static async findByEstabelecimento(estabelecimentoId) {
    try {
      const sql = 'SELECT * FROM filas WHERE estabelecimento_id = ? ORDER BY created_at DESC';
      
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [estabelecimentoId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      return results.map(row => new Queue(row));
      
    } catch (error) {
      console.error('❌ Erro ao buscar filas do estabelecimento:', error);
      throw new Error('Falha ao buscar filas do estabelecimento');
    }
  }

  /**
   * Adiciona cliente à fila
   * 
   * @param {Object} clientData - Dados do cliente
   * @returns {Promise<Object>} - Resultado da operação
   */
  async addClient(clientData) {
    try {
      // Verifica se a fila está ativa
      if (this.status !== 'ativa') {
        throw new Error('Fila não está ativa');
      }
      
      // Verifica se o cliente já está na fila (por email ou telefone)
      // Usa verificação direta no Redis para evitar problemas com dados corrompidos
      const queueClients = await redisService.getQueueClients(this.id);
      let isDuplicate = false;
      
      for (const [clientDataStr, score] of queueClients) {
        try {
          const existingClient = JSON.parse(clientDataStr);
          if (existingClient.email === clientData.email || existingClient.telefone === clientData.telefone) {
            isDuplicate = true;
            break;
          }
        } catch (parseError) {
          // Ignora dados corrompidos na verificação de duplicidade
          console.warn('Dados corrompidos ignorados na verificação de duplicidade:', clientDataStr);
          continue;
        }
      }
      
      if (isDuplicate) {
        throw new Error('Cliente já está nesta fila');
      }
      
      // Gera ID único para o cliente
      const clientId = uuidUtils.generateClientId();
      const clientWithId = { ...clientData, id: clientId };
      
      // Prepara dados do cliente (sem criptografia para testes)
      const encryptedClientData = cryptoUtils.encryptClientData(clientWithId);
      
      // Obtém próxima posição na fila
      const queueSize = await redisService.getQueueSize(this.id);
      const position = queueSize + 1;
      
      // Adiciona cliente à fila no Redis
      await redisService.addClientToQueue(this.id, position, JSON.stringify(encryptedClientData));
      
      console.log(`✅ Cliente adicionado à fila ${this.nome}: ${clientData.nome} (Posição: ${position})`);
      
      return {
        success: true,
        clientId: clientId,
        position: position,
        estimatedTime: this.calculateEstimatedTime(position)
      };
      
    } catch (error) {
      console.error('❌ Erro ao adicionar cliente:', error);
      throw error;
    }
  }

  /**
   * Remove cliente da fila
   * 
   * @param {string} clientId - ID do cliente
   * @returns {Promise<boolean>} - True se removido com sucesso
   */
  async removeClient(clientId) {
    try {
      // Busca dados do cliente na fila
      const clients = await redisService.getQueueClients(this.id);
      
      for (const [clientData, score] of clients) {
        const clientInfo = JSON.parse(clientData);
        
        if (clientInfo.id === clientId) {
          await redisService.removeClientFromQueue(this.id, clientData);
          console.log(`✅ Cliente removido da fila ${this.nome}: ${clientInfo.nome}`);
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Erro ao remover cliente:', error);
      throw error;
    }
  }

  /**
   * Avança cliente na fila (pagamento)
   * 
   * @param {string} clientId - ID do cliente
   * @param {number} positions - Número de posições para avançar
   * @returns {Promise<Object>} - Resultado da operação
   */
  async advanceClient(clientId, positions) {
    try {
      // Valida número de avanços
      if (positions > this.max_avancos) {
        throw new Error(`Máximo de ${this.max_avancos} avanços permitidos`);
      }
      
      // Busca cliente na fila
      const clients = await redisService.getQueueClients(this.id);
      let clientData = null;
      let currentPosition = null;
      
      for (const [clientDataStr, score] of clients) {
        const clientInfo = JSON.parse(clientDataStr);
        if (clientInfo.id === clientId) {
          clientData = clientDataStr;
          currentPosition = score;
          break;
        }
      }
      
      if (!clientData) {
        throw new Error('Cliente não encontrado na fila');
      }
      
      // Calcula nova posição
      const newPosition = Math.max(1, currentPosition - positions);
      
      // Move cliente para nova posição
      await redisService.moveClientInQueue(this.id, clientData, newPosition);
      
      console.log(`✅ Cliente avançou ${positions} posições na fila ${this.nome}: ${clientId}`);
      
      return {
        success: true,
        oldPosition: currentPosition,
        newPosition: newPosition,
        positionsAdvanced: positions,
        estimatedTime: this.calculateEstimatedTime(newPosition)
      };
      
    } catch (error) {
      console.error('❌ Erro ao avançar cliente:', error);
      throw error;
    }
  }

  /**
   * Obtém posição do cliente na fila
   * 
   * @param {string} clientId - ID do cliente
   * @returns {Promise<Object|null>} - Dados da posição ou null
   */
  async getClientPosition(clientId) {
    try {
      const clients = await redisService.getQueueClients(this.id);
      
      for (const [clientDataStr, score] of clients) {
        const clientInfo = JSON.parse(clientDataStr);
        if (clientInfo.id === clientId) {
          return {
            position: score,
            estimatedTime: this.calculateEstimatedTime(score),
            totalClients: clients.length
          };
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao obter posição do cliente:', error);
      throw error;
    }
  }

  /**
   * Lista clientes da fila (descriptografado para estabelecimento)
   * 
   * @param {boolean} isEstablishment - Se é visualização do estabelecimento
   * @returns {Promise<Array>} - Lista de clientes
   */
  async getClients(isEstablishment = false) {
    try {
      const clients = await redisService.getQueueClients(this.id);
      const clientList = [];
      
      for (const [clientDataStr, score] of clients) {
        let clientInfo;
        try {
          clientInfo = JSON.parse(clientDataStr);
        } catch (parseError) {
          console.error('Erro ao fazer parse do cliente:', clientDataStr, parseError);
          continue; // Pula este cliente e continua com os próximos
        }
        
        if (isEstablishment) {
          // Estabelecimento vê todos os dados
          clientList.push({
            id: clientInfo.id,
            nome: clientInfo.nome,
            telefone: clientInfo.telefone,
            email: clientInfo.email,
            position: score,
            timestamp: clientInfo.timestamp
          });
        } else {
          // Cliente vê apenas dados parciais
          clientList.push({
            id: clientInfo.id,
            nome: clientInfo.nome,
            position: score,
            timestamp: clientInfo.timestamp
          });
        }
      }
      
      return clientList.sort((a, b) => a.position - b.position);
      
    } catch (error) {
      console.error('❌ Erro ao obter clientes da fila:', error);
      throw error;
    }
  }

  /**
   * Calcula tempo estimado de espera
   * 
   * @param {number} position - Posição na fila
   * @returns {number} - Tempo estimado em minutos
   */
  calculateEstimatedTime(position) {
    return (position - 1) * this.tempo_estimado;
  }

  /**
   * Atualiza status da fila
   * 
   * @param {string} newStatus - Novo status
   * @returns {Promise<boolean>} - True se atualizado com sucesso
   */
  async updateStatus(newStatus) {
    try {
      this.status = newStatus;
      this.updated_at = new Date();
      
      // Atualiza no MySQL
      const sql = 'UPDATE filas SET status = ?, updated_at = ? WHERE id = ?';
      
      await new Promise((resolve, reject) => {
        connection.query(sql, [newStatus, this.updated_at, this.id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      // Atualiza metadados no Redis
      await redisService.setQueueMetadata(this.id, {
        status: newStatus,
        updated_at: this.updated_at.toISOString()
      });
      
      console.log(`✅ Status da fila ${this.nome} atualizado para: ${newStatus}`);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar status da fila:', error);
      throw error;
    }
  }

  /**
   * Encerra fila e limpa dados do Redis
   * 
   * @returns {Promise<boolean>} - True se encerrada com sucesso
   */
  async close() {
    try {
      // Atualiza status para encerrada
      await this.updateStatus('encerrada');
      
      // Remove dados do Redis
      await redisService.deleteQueue(this.id);
      
      console.log(`✅ Fila ${this.nome} encerrada e dados limpos do Redis`);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao encerrar fila:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas da fila
   * 
   * @returns {Promise<Object>} - Estatísticas da fila
   */
  async getStats() {
    try {
      const queueSize = await redisService.getQueueSize(this.id);
      
      // Tenta obter clientes, mas não falha se houver erro
      let clients = [];
      try {
        clients = await this.getClients(true);
      } catch (clientError) {
        console.warn('Erro ao obter clientes para estatísticas:', clientError.message);
        // Continua com array vazio se não conseguir obter clientes
      }
      
      return {
        totalClients: queueSize,
        averageWaitTime: queueSize > 0 ? (queueSize * this.tempo_estimado) / 2 : 0,
        status: this.status,
        createdAt: this.created_at,
        lastUpdated: this.updated_at
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas da fila:', error);
      throw error;
    }
  }
}

module.exports = Queue;
