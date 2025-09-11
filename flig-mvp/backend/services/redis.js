/**
 * Serviço de Conexão Redis para Sistema de Filas Flig
 * 
 * Este módulo gerencia a conexão com Redis e fornece métodos
 * para manipulação de ZSETs (Sorted Sets) que são usados para
 * implementar as filas virtuais do sistema.
 * 
 * Como funciona o Redis ZSET para filas:
 * - Score: posição na fila (menor score = posição mais próxima do atendimento)
 * - Member: dados criptografados do cliente
 * - Operações: ZADD (adicionar), ZRANGE (listar), ZREM (remover), ZRANK (posição)
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const redis = require('redis');

// Configuração do Redis
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
};

// Cliente Redis global
let redisClient = null;

/**
 * Inicializa conexão com Redis
 * 
 * @returns {Promise<Object>} - Cliente Redis conectado
 */
async function connectRedis() {
  try {
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }

    redisClient = redis.createClient(REDIS_CONFIG);
    
    // Event listeners para monitoramento
    redisClient.on('connect', () => {
      console.log('✅ Conectado ao Redis');
    });
    
    redisClient.on('error', (err) => {
      console.error('❌ Erro no Redis:', err);
    });
    
    redisClient.on('end', () => {
      console.log('🔌 Conexão Redis encerrada');
    });

    await redisClient.connect();
    return redisClient;
    
  } catch (error) {
    console.error('❌ Falha ao conectar com Redis:', error);
    throw new Error('Não foi possível conectar com Redis');
  }
}

/**
 * Fecha conexão com Redis
 */
async function disconnectRedis() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Obtém cliente Redis (conecta se necessário)
 * 
 * @returns {Promise<Object>} - Cliente Redis
 */
async function getRedisClient() {
  if (!redisClient || !redisClient.isOpen) {
    await connectRedis();
  }
  return redisClient;
}

/**
 * Verifica se Redis está disponível
 * 
 * @returns {Promise<boolean>} - True se Redis estiver funcionando
 */
async function isRedisAvailable() {
  try {
    const client = await getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis não disponível:', error);
    return false;
  }
}

/**
 * Gera chave Redis para uma fila específica
 * 
 * @param {string} queueId - ID da fila
 * @returns {string} - Chave Redis formatada
 */
function getQueueKey(queueId) {
  return `flig:queue:${queueId}`;
}

/**
 * Gera chave Redis para metadados da fila
 * 
 * @param {string} queueId - ID da fila
 * @returns {string} - Chave Redis para metadados
 */
function getQueueMetaKey(queueId) {
  return `flig:queue:meta:${queueId}`;
}

/**
 * Gera chave Redis para estatísticas da fila
 * 
 * @param {string} queueId - ID da fila
 * @returns {string} - Chave Redis para estatísticas
 */
function getQueueStatsKey(queueId) {
  return `flig:queue:stats:${queueId}`;
}

/**
 * Adiciona cliente à fila usando ZADD
 * 
 * @param {string} queueId - ID da fila
 * @param {number} position - Posição na fila (score)
 * @param {string} clientData - Dados criptografados do cliente
 * @returns {Promise<number>} - Número de elementos adicionados
 */
async function addClientToQueue(queueId, position, clientData) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    
    // ZADD adiciona ou atualiza elemento no ZSET
    // Score = posição na fila, Member = dados do cliente
    const result = await client.zAdd(queueKey, {
      score: position,
      value: clientData
    });
    
    return result;
  } catch (error) {
    console.error('Erro ao adicionar cliente à fila:', error);
    throw new Error('Falha ao adicionar cliente à fila');
  }
}

/**
 * Remove cliente da fila usando ZREM
 * 
 * @param {string} queueId - ID da fila
 * @param {string} clientData - Dados do cliente a ser removido
 * @returns {Promise<number>} - Número de elementos removidos
 */
async function removeClientFromQueue(queueId, clientData) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    
    // ZREM remove elemento específico do ZSET
    const result = await client.zRem(queueKey, clientData);
    
    return result;
  } catch (error) {
    console.error('Erro ao remover cliente da fila:', error);
    throw new Error('Falha ao remover cliente da fila');
  }
}

/**
 * Obtém posição do cliente na fila usando ZRANK
 * 
 * @param {string} queueId - ID da fila
 * @param {string} clientData - Dados do cliente
 * @returns {Promise<number|null>} - Posição na fila (0-based) ou null se não encontrado
 */
async function getClientPosition(queueId, clientData) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    
    // ZRANK retorna posição do elemento no ZSET (0-based)
    const position = await client.zRank(queueKey, clientData);
    
    return position !== null ? position + 1 : null; // Converte para 1-based
  } catch (error) {
    console.error('Erro ao obter posição do cliente:', error);
    throw new Error('Falha ao obter posição do cliente');
  }
}

/**
 * Lista todos os clientes da fila usando ZRANGE
 * 
 * @param {string} queueId - ID da fila
 * @param {number} start - Posição inicial (0-based)
 * @param {number} stop - Posição final (0-based)
 * @returns {Promise<Array>} - Array com dados dos clientes
 */
async function getQueueClients(queueId, start = 0, stop = -1) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    
    // ZRANGE retorna elementos ordenados por score
    const clients = await client.zRange(queueKey, start, stop, {
      WITHSCORES: true // Inclui scores (posições)
    });
    
    return clients;
  } catch (error) {
    console.error('Erro ao obter clientes da fila:', error);
    throw new Error('Falha ao obter clientes da fila');
  }
}

/**
 * Obtém tamanho da fila usando ZCARD
 * 
 * @param {string} queueId - ID da fila
 * @returns {Promise<number>} - Número de clientes na fila
 */
async function getQueueSize(queueId) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    
    // ZCARD retorna número de elementos no ZSET
    const size = await client.zCard(queueKey);
    
    return size;
  } catch (error) {
    console.error('Erro ao obter tamanho da fila:', error);
    throw new Error('Falha ao obter tamanho da fila');
  }
}

/**
 * Move cliente para nova posição na fila
 * 
 * @param {string} queueId - ID da fila
 * @param {string} clientData - Dados do cliente
 * @param {number} newPosition - Nova posição
 * @returns {Promise<boolean>} - True se movimento foi bem-sucedido
 */
async function moveClientInQueue(queueId, clientData, newPosition) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    
    // ZADD atualiza score se elemento já existir
    const result = await client.zAdd(queueKey, {
      score: newPosition,
      value: clientData
    });
    
    return result > 0;
  } catch (error) {
    console.error('Erro ao mover cliente na fila:', error);
    throw new Error('Falha ao mover cliente na fila');
  }
}

/**
 * Remove toda a fila do Redis
 * 
 * @param {string} queueId - ID da fila
 * @returns {Promise<boolean>} - True se remoção foi bem-sucedida
 */
async function deleteQueue(queueId) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    const metaKey = getQueueMetaKey(queueId);
    const statsKey = getQueueStatsKey(queueId);
    
    // Remove todas as chaves relacionadas à fila
    await client.del([queueKey, metaKey, statsKey]);
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar fila:', error);
    throw new Error('Falha ao deletar fila');
  }
}

/**
 * Define metadados da fila
 * 
 * @param {string} queueId - ID da fila
 * @param {Object} metadata - Metadados da fila
 * @returns {Promise<boolean>} - True se definição foi bem-sucedida
 */
async function setQueueMetadata(queueId, metadata) {
  try {
    const client = await getRedisClient();
    const metaKey = getQueueMetaKey(queueId);
    
    // HSET define campos do hash - Redis v4 espera argumentos separados
    const fields = [];
    for (const [key, value] of Object.entries(metadata)) {
      fields.push(key, String(value)); // Converter todos os valores para string
    }
    await client.hSet(metaKey, fields);
    
    return true;
  } catch (error) {
    console.error('Erro ao definir metadados da fila:', error);
    throw new Error('Falha ao definir metadados da fila');
  }
}

/**
 * Obtém metadados da fila
 * 
 * @param {string} queueId - ID da fila
 * @returns {Promise<Object>} - Metadados da fila
 */
async function getQueueMetadata(queueId) {
  try {
    const client = await getRedisClient();
    const metaKey = getQueueMetaKey(queueId);
    
    // HGETALL retorna todos os campos do hash
    const metadata = await client.hGetAll(metaKey);
    
    return metadata;
  } catch (error) {
    console.error('Erro ao obter metadados da fila:', error);
    throw new Error('Falha ao obter metadados da fila');
  }
}

module.exports = {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  isRedisAvailable,
  getQueueKey,
  getQueueMetaKey,
  getQueueStatsKey,
  addClientToQueue,
  removeClientFromQueue,
  getClientPosition,
  getQueueClients,
  getQueueSize,
  moveClientInQueue,
  deleteQueue,
  setQueueMetadata,
  getQueueMetadata
};

