/**
 * Serviço de Conexão Redis para Sistema de Filas Flig (Atualizado)
 * 
 * Serializa todos os dados de clientes para JSON ao adicionar
 * e desserializa ao ler, evitando erros de JSON.parse.
 * 
 * @version 2.0.0
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

let redisClient = null;

// Conecta ao Redis
async function connectRedis() {
  try {
    if (redisClient && redisClient.isOpen) return redisClient;

    redisClient = redis.createClient(REDIS_CONFIG);

    redisClient.on('connect', () => console.log('✅ Conectado ao Redis'));
    redisClient.on('error', (err) => console.error('❌ Erro no Redis:', err));
    redisClient.on('end', () => console.log('🔌 Conexão Redis encerrada'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Falha ao conectar com Redis:', error);
    throw new Error('Não foi possível conectar com Redis');
  }
}

async function disconnectRedis() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

async function getRedisClient() {
  if (!redisClient || !redisClient.isOpen) {
    await connectRedis();
  }
  return redisClient;
}

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

function getQueueKey(queueId) {
  return `flig:queue:${queueId}`;
}

function getQueueMetaKey(queueId) {
  return `flig:queue:meta:${queueId}`;
}

function getQueueStatsKey(queueId) {
  return `flig:queue:stats:${queueId}`;
}

// Adiciona cliente à fila
async function addClientToQueue(queueId, position, clientData) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);

    const value = typeof clientData === 'string' ? clientData : JSON.stringify(clientData);

    const result = await client.zAdd(queueKey, { score: position, value });
    return result;
  } catch (error) {
    console.error('Erro ao adicionar cliente à fila:', error);
    throw new Error('Falha ao adicionar cliente à fila');
  }
}

// Remove cliente da fila
async function removeClientFromQueue(queueId, clientData) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);

    // Se já é string, usa diretamente; senão converte para JSON
    const value = typeof clientData === 'string' ? clientData : JSON.stringify(clientData);

    console.log(`🔍 Tentando remover cliente da fila ${queueId}`);
    console.log(`🔍 Queue key: ${queueKey}`);
    console.log(`🔍 Cliente value: ${value}`);
    
    // Verificar se a fila existe
    const exists = await client.exists(queueKey);
    console.log(`🔍 Fila existe: ${exists}`);
    
    if (exists) {
      const allClients = await client.zRange(queueKey, 0, -1);
      console.log(`📋 Clientes na fila antes da remoção:`, allClients);
      
      // Tentar remover usando o valor exato
      const result = await client.zRem(queueKey, value);
      console.log(`✅ Resultado da remoção: ${result}`);
      
      if (result === 0) {
        console.log(`⚠️ Cliente não encontrado na fila. Tentando com valor exato...`);
        // Tentar com o valor exato do Redis
        if (allClients.length > 0) {
          const exactValue = allClients[0];
          console.log(`🔍 Tentando com valor exato: ${exactValue}`);
          const result2 = await client.zRem(queueKey, exactValue);
          console.log(`✅ Resultado da remoção com valor exato: ${result2}`);
          return result2;
        }
      }
      
      return result;
    }
    
    return 0;
  } catch (error) {
    console.error('Erro ao remover cliente da fila:', error);
    throw new Error('Falha ao remover cliente da fila');
  }
}

// Obtém posição do cliente
async function getClientPosition(queueId, clientData) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);

    const value = typeof clientData === 'string' ? clientData : JSON.stringify(clientData);

    const position = await client.zRank(queueKey, value);
    return position !== null ? position + 1 : null; // 1-based
  } catch (error) {
    console.error('Erro ao obter posição do cliente:', error);
    throw new Error('Falha ao obter posição do cliente');
  }
}

// Lista clientes da fila
async function getQueueClients(queueId, start = 0, stop = -1) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);

    // Usar zRangeWithScores para obter todos os clientes com scores
    const rawClients = await client.zRangeWithScores(queueKey, start, stop);

    const clients = [];

    if (Array.isArray(rawClients)) {
      // zRangeWithScores retorna objetos com { value, score }
      for (const item of rawClients) {
        try {
          const value = item.value || item;
          const score = item.score || (rawClients.indexOf(item) + 1);
          
          const clientObj = JSON.parse(value);
          clients.push({ 
            ...clientObj, 
            position: Number(score) || 1 
          });
        } catch (err) {
          console.warn('Cliente inválido ignorado:', item);
          continue;
        }
      }
    }

    return clients;
  } catch (error) {
    console.error('Erro ao obter clientes da fila:', error);
    throw new Error('Falha ao obter clientes da fila');
  }
}

// Define clientes da fila (substitui todos os clientes)
async function setQueueClients(queueId, clients) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);

    // Remove todos os clientes existentes
    await client.del(queueKey);

    // Adiciona os novos clientes
    for (let i = 0; i < clients.length; i++) {
      const clientData = clients[i];
      const position = i + 1;
      const value = typeof clientData === 'string' ? clientData : JSON.stringify(clientData);
      
      await client.zAdd(queueKey, { score: position, value });
    }

    console.log(`✅ ${clients.length} clientes definidos para a fila ${queueId}`);
    return true;
  } catch (error) {
    console.error('Erro ao definir clientes da fila:', error);
    throw new Error('Falha ao definir clientes da fila');
  }
}

// Obtém tamanho da fila
async function getQueueSize(queueId) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    const size = await client.zCard(queueKey);
    return size;
  } catch (error) {
    console.error('Erro ao obter tamanho da fila:', error);
    throw new Error('Falha ao obter tamanho da fila');
  }
}

// Move cliente na fila
async function moveClientInQueue(queueId, clientData, newPosition) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);

    const value = typeof clientData === 'string' ? clientData : JSON.stringify(clientData);

    const result = await client.zAdd(queueKey, { score: newPosition, value });
    return result > 0;
  } catch (error) {
    console.error('Erro ao mover cliente na fila:', error);
    throw new Error('Falha ao mover cliente na fila');
  }
}

// Deleta toda a fila
async function deleteQueue(queueId) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);
    const metaKey = getQueueMetaKey(queueId);
    const statsKey = getQueueStatsKey(queueId);

    await client.del([queueKey, metaKey, statsKey]);
    return true;
  } catch (error) {
    console.error('Erro ao deletar fila:', error);
    throw new Error('Falha ao deletar fila');
  }
}

// Define metadados da fila
async function setQueueMetadata(queueId, metadata) {
  try {
    const client = await getRedisClient();
    const metaKey = getQueueMetaKey(queueId);

    const fields = [];
    for (const [key, value] of Object.entries(metadata)) {
      fields.push(key, String(value));
    }

    await client.hSet(metaKey, fields);
    return true;
  } catch (error) {
    console.error('Erro ao definir metadados da fila:', error);
    throw new Error('Falha ao definir metadados da fila');
  }
}

// Obtém metadados da fila
async function getQueueMetadata(queueId) {
  try {
    const client = await getRedisClient();
    const metaKey = getQueueMetaKey(queueId);
    const metadata = await client.hGetAll(metaKey);
    return metadata;
  } catch (error) {
    console.error('Erro ao obter metadados da fila:', error);
    throw new Error('Falha ao obter metadados da fila');
  }
}

// Obtém o próximo cliente da fila (o primeiro da fila)
async function getNextClient(queueId) {
  try {
    const client = await getRedisClient();
    const queueKey = getQueueKey(queueId);

    console.log('🔍 Buscando próximo cliente na fila:', queueKey);

    // Busca o primeiro cliente (menor score = posição 1)
    const result = await client.zRange(queueKey, 0, 0, { withScores: true });
    
    console.log('📊 Resultado da busca:', result);
    
    if (result.length === 0) {
      console.log('❌ Fila vazia');
      return null; // Fila vazia
    }

    // O resultado pode vir em formatos diferentes dependendo da versão do Redis
    let clientData, score;
    
    if (Array.isArray(result[0])) {
      // Formato antigo: [value, score]
      [clientData, score] = result[0];
    } else {
      // Formato novo: {value, score}
      clientData = result[0].value;
      score = result[0].score;
    }
    
    console.log('📝 Dados do cliente:', clientData);
    console.log('🎯 Score:', score);
    
    const clientInfo = JSON.parse(clientData);
    
    return {
      ...clientInfo,
      position: score
    };
  } catch (error) {
    console.error('❌ Erro ao obter próximo cliente:', error);
    throw new Error('Falha ao obter próximo cliente');
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
  setQueueClients,
  getQueueSize,
  moveClientInQueue,
  deleteQueue,
  setQueueMetadata,
  getQueueMetadata,
  getNextClient
};
