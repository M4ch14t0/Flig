/**
 * Serviço de Conexão Redis para Sistema de Filas Flig (Arquitetura de Duas Filas)
 * 
 * Nova arquitetura: Duas filas separadas
 * - Fila Principal: Gerencia posições principais (1, 2, 3, 4, etc.)
 * - Fila de Subdivisões: Gerencia subposições (a, b, c, etc.) com IDs condizentes
 * 
 * Vantagens:
 * - Reorganização automática simples
 * - Sem necessidade de recalcular scores
 * - Lógica mais clara e eficiente
 * 
 * @version 5.0.0
 */

import redis from 'redis';

// Configuração do Redis
console.log('🔍 Redis Environment Variables:');
console.log('REDISHOST:', process.env.REDISHOST);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDISPORT:', process.env.REDISPORT);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDISPASSWORD:', process.env.REDISPASSWORD);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD);

// Tentar usar URL do Redis primeiro
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_PUBLIC_URL;

console.log('🔍 Redis URL:', REDIS_URL);

const REDIS_CONFIG = REDIS_URL ? {
  url: REDIS_URL,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
} : {
  host: process.env.REDISHOST || process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDISPORT || process.env.REDIS_PORT || 6379),
  password: process.env.REDISPASSWORD || process.env.REDIS_PASSWORD || null,
  db: parseInt(process.env.REDIS_DB || 0),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
};

console.log('🔧 Redis Config:', REDIS_CONFIG);

let redisClient = null;

// Conecta ao Redis
async function connectRedis() {
  try {
    if (redisClient && redisClient.isOpen) return redisClient;

    console.log('🔧 Criando cliente Redis com configuração:', REDIS_CONFIG);
    
    // Forçar configuração explícita
    if (REDIS_CONFIG.url) {
      console.log('🔗 Usando URL do Redis:', REDIS_CONFIG.url);
      redisClient = redis.createClient({ 
        url: REDIS_CONFIG.url,
        socket: {
          connectTimeout: 15000,
          lazyConnect: false
        }
      });
    } else {
      console.log('🔧 Usando configuração individual do Redis');
      console.log('Host:', REDIS_CONFIG.host);
      console.log('Port:', REDIS_CONFIG.port);
      console.log('Password:', REDIS_CONFIG.password ? '***' : 'null');
      
      redisClient = redis.createClient({
        socket: {
          host: REDIS_CONFIG.host,
          port: REDIS_CONFIG.port,
          connectTimeout: 15000,
          lazyConnect: false
        },
        password: REDIS_CONFIG.password,
        database: REDIS_CONFIG.db
      });
    }

    redisClient.on('connect', () => console.log('✅ Conectado ao Redis'));
    redisClient.on('error', (err) => console.error('❌ Erro no Redis:', err));
    redisClient.on('end', () => console.log('🔌 Conexão Redis encerrada'));

    console.log('🔌 Tentando conectar ao Redis...');
    await redisClient.connect();
    console.log('✅ Redis conectado com sucesso!');
    return redisClient;
  } catch (error) {
    console.error('❌ Falha ao conectar com Redis:', error);
    console.log('⚠️ Continuando sem Redis...');
    // Não falhar a aplicação, retornar null
    return null;
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
    redisClient = await connectRedis();
  }
  return redisClient;
}

async function isRedisAvailable() {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.log('⚠️ Redis não disponível');
      return false;
    }
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis não disponível:', error);
    return false;
  }
}

// NOVA ARQUITETURA: Duas filas separadas
function getMainQueueKey(queueId) {
  return `flig:queue:${queueId}:main`;
}

function getSubdivisionQueueKey(queueId) {
  return `flig:queue:${queueId}:sub`;
}

function getQueueMetaKey(queueId) {
  return `flig:queue:meta:${queueId}`;
}

function getQueueStatsKey(queueId) {
  return `flig:queue:stats:${queueId}`;
}

// Adiciona cliente à fila principal (nova arquitetura)
async function addClientToQueue(queueId, position, clientData, subPosition = 'a') {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.log('⚠️ Redis não disponível, pulando operação');
      return false;
    }
    
    const mainQueueKey = getMainQueueKey(queueId);
    const subQueueKey = getSubdivisionQueueKey(queueId);
    
    // Verificar se já há clientes nesta posição principal
    const existingClients = await client.zRangeByScore(mainQueueKey, position, position);
    console.log(`🔍 Clientes existentes na posição principal ${position}:`, existingClients);
    
    if (existingClients.length > 0) {
      // Há clientes nesta posição, vamos criar subdivisão
      // Calcular próxima subposição disponível (b, c, d, etc.)
      const existingSubs = await client.zRangeByScore(subQueueKey, position, position);
      const nextSubPosition = String.fromCharCode(97 + existingSubs.length + 1); // b, c, d, etc.
      
      console.log(`🔄 Criando subdivisão na posição ${position}${nextSubPosition}`);
      
      // Criar ID único para a subdivisão
      const subdivisionId = `${position}-${nextSubPosition}`;
      
      // Adicionar à fila de subdivisões
      await client.zAdd(subQueueKey, {
        score: position,
        value: JSON.stringify({
          ...clientData,
          position,
          subPosition: nextSubPosition,
          subdivisionId,
          isSubdivision: true
        })
      });
      
      console.log(`✅ Cliente ${clientData.nome} adicionado na subdivisão ${position}${nextSubPosition}`);
    } else {
      // Posição principal vazia, adicionar normalmente
      await client.zAdd(mainQueueKey, {
        score: position,
        value: JSON.stringify({
          ...clientData,
          position,
          subPosition: 'a',
          subdivisionId: `${position}-a`,
          isSubdivision: false
        })
      });
      
      console.log(`✅ Cliente ${clientData.nome} adicionado na posição principal ${position}a`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar cliente à fila:', error);
    return false;
  }
}

// Remove cliente da fila (nova arquitetura)
async function removeClientFromQueue(queueId, clientData) {
  try {
    const client = await getRedisClient();
    if (!client) {
      console.log('⚠️ Redis não disponível, pulando operação');
      return false;
    }

    console.log(`🔍 Tentando remover cliente da fila ${queueId}`);
    console.log(`🔍 Cliente data:`, clientData);
    
    const mainQueueKey = getMainQueueKey(queueId);
    const subQueueKey = getSubdivisionQueueKey(queueId);
    
    // Buscar cliente na fila principal
    const mainClients = await client.zRangeWithScores(mainQueueKey, 0, -1);
    for (const item of mainClients) {
      try {
        const clientObj = JSON.parse(item.value);
          if ((clientData.id && clientObj.id === clientData.id) || 
              (clientData.email && clientObj.email === clientData.email)) {
          
          await client.zRem(mainQueueKey, item.value);
          console.log(`✅ Cliente ${clientObj.nome} removido da fila principal`);
          return true;
          }
        } catch (parseError) {
          console.warn('Erro ao fazer parse do cliente:', parseError);
        }
      }
      
    // Buscar cliente na fila de subdivisões
    const subClients = await client.zRangeWithScores(subQueueKey, 0, -1);
    for (const item of subClients) {
      try {
        const clientObj = JSON.parse(item.value);
        if ((clientData.id && clientObj.id === clientData.id) || 
            (clientData.email && clientObj.email === clientData.email)) {
          
          await client.zRem(subQueueKey, item.value);
          console.log(`✅ Cliente ${clientObj.nome} removido da fila de subdivisões`);
          return true;
        }
      } catch (parseError) {
        console.warn('Erro ao fazer parse do cliente:', parseError);
      }
    }
    
    console.log(`⚠️ Cliente com email ${clientData.email} não encontrado na fila`);
    return false;
  } catch (error) {
    console.error('Erro ao remover cliente da fila:', error);
    return false;
  }
}

// Lista clientes da fila (nova arquitetura)
async function getQueueClients(queueId, start = 0, stop = -1) {
  try {
    const client = await getRedisClient();
    if (!client) return [];
    
    const mainQueueKey = getMainQueueKey(queueId);
    const subQueueKey = getSubdivisionQueueKey(queueId);
    
    // Obter clientes da fila principal
    const mainClients = await client.zRangeWithScores(mainQueueKey, start, stop);
    const subClients = await client.zRangeWithScores(subQueueKey, start, stop);
    
    const allClients = [];
    
    // Processar clientes da fila principal
    for (const item of mainClients) {
      try {
        const clientObj = JSON.parse(item.value);
        allClients.push(clientObj);
      } catch (parseError) {
        console.warn('Cliente inválido ignorado:', item.value);
          continue;
      }
    }
    
    // Processar clientes da fila de subdivisões
    for (const item of subClients) {
      try {
        const clientObj = JSON.parse(item.value);
        allClients.push(clientObj);
      } catch (parseError) {
        console.warn('Cliente inválido ignorado:', item.value);
        continue;
      }
    }
    
    // Ordenar por posição e subposição
    allClients.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position;
      }
      return (a.subPosition || 'a').localeCompare(b.subPosition || 'a');
    });
    
    return allClients;
  } catch (error) {
    console.error('Erro ao obter clientes da fila:', error);
    throw new Error('Falha ao obter clientes da fila');
  }
}

// Obtém o próximo cliente da fila (nova arquitetura)
async function getNextClient(queueId) {
  try {
    const client = await getRedisClient();
    if (!client) return null;
    
    console.log('🔍 Buscando próximo cliente na fila:', queueId);
    
    const mainQueueKey = getMainQueueKey(queueId);
    
    // Buscar o primeiro cliente da fila principal
    const result = await client.zRange(mainQueueKey, 0, 0, { withScores: true });
    
    console.log('📊 Resultado da busca:', result);
    
    if (result.length === 0) {
      console.log('❌ Fila vazia');
      return null;
    }

    let clientData, score;
    
    if (Array.isArray(result[0])) {
      [clientData, score] = result[0];
    } else if (result[0].value !== undefined) {
      clientData = result[0].value;
      score = result[0].score;
    } else {
      clientData = result[0];
      score = 1;
    }
    
    console.log('📝 Dados do cliente:', clientData);
    console.log('🎯 Score:', score);
    
    if (!clientData || typeof clientData !== 'string') {
      console.error('❌ Dados do cliente inválidos:', clientData);
      throw new Error('Dados do cliente inválidos');
    }
    
    const clientInfo = JSON.parse(clientData);
    
    return {
      ...clientInfo,
      position: clientInfo.position,
      subPosition: clientInfo.subPosition
    };
  } catch (error) {
    console.error('❌ Erro ao obter próximo cliente:', error);
    throw new Error('Falha ao obter próximo cliente');
  }
}

// Nova função: Chama próximo cliente com movimento automático (NOVA ARQUITETURA)
async function callNextClientWithAutoMove(queueId) {
  try {
    console.log(`🔍 Chamando próximo cliente da fila ${queueId} com movimento automático (nova arquitetura)`);
    
    // 1. Obter próximo cliente
    const nextClient = await getNextClient(queueId);
    if (!nextClient) {
      console.log('❌ Não há clientes na fila');
      return null;
    }
    
    console.log(`📞 Chamando cliente: ${nextClient.nome} (posição ${nextClient.position}${nextClient.subPosition})`);
    
    // 2. Remover cliente da fila
    await removeClientFromQueue(queueId, nextClient);
    
    // 3. Aplicar movimento automático a todos os clientes restantes
    await applyAutoMove(queueId);
    
    console.log(`✅ Cliente ${nextClient.nome} chamado e movimento automático aplicado`);
    return nextClient;
    
  } catch (error) {
    console.error('❌ Erro ao chamar próximo cliente:', error);
    throw new Error('Falha ao chamar próximo cliente');
  }
}

// Aplica movimento automático após chamada (LÓGICA CORRETA DE SUBDIVISÕES)
async function applyAutoMove(queueId) {
  try {
    console.log(`🔄 Aplicando movimento automático na fila ${queueId} (lógica correta de subdivisões)`);
    
    const client = await getRedisClient();
    if (!client) return;
    
    const mainQueueKey = getMainQueueKey(queueId);
    const subQueueKey = getSubdivisionQueueKey(queueId);
    
    // 1. Obter todos os clientes da fila principal e subdivisões
    const mainClients = await client.zRangeWithScores(mainQueueKey, 0, -1);
    const subClients = await client.zRangeWithScores(subQueueKey, 0, -1);
    
    if (mainClients.length === 0 && subClients.length === 0) {
      console.log('📋 Fila vazia, nada para mover');
      return;
    }
    
    console.log(`📋 Movendo ${mainClients.length} clientes principais e ${subClients.length} subdivisões`);
    
    // 2. Limpar ambas as filas
    await client.del(mainQueueKey);
    await client.del(subQueueKey);
    
    // 3. LÓGICA CORRETA: Agrupar clientes por posição original
    const positionMap = new Map();
    
    // Processar clientes principais
    for (const item of mainClients) {
      try {
        const clientObj = JSON.parse(item.value);
        const position = clientObj.position;
        
        if (!positionMap.has(position)) {
          positionMap.set(position, { main: null, subs: [] });
        }
        positionMap.get(position).main = clientObj;
      } catch (parseError) {
        console.warn('Erro ao processar cliente principal:', parseError);
      }
    }
    
    // Processar subdivisões
    for (const item of subClients) {
      try {
        const clientObj = JSON.parse(item.value);
        const position = clientObj.position;
        
        if (!positionMap.has(position)) {
          positionMap.set(position, { main: null, subs: [] });
        }
        positionMap.get(position).subs.push(clientObj);
      } catch (parseError) {
        console.warn('Erro ao processar subdivisão:', parseError);
      }
    }
    
    // 4. LÓGICA CORRETA: Reorganizar tratando subdivisões individualmente
    const sortedPositions = Array.from(positionMap.keys()).sort((a, b) => a - b);
    let newPosition = 1;
    
    for (const oldPosition of sortedPositions) {
      const positionData = positionMap.get(oldPosition);
      const { main, subs } = positionData;
      
      // Ordenar subdivisões por subposição (a, b, c, etc.)
      subs.sort((a, b) => {
        const subA = a.subPosition || 'a';
        const subB = b.subPosition || 'a';
        return subA.localeCompare(subB);
      });
      
      if (main) {
        // Há cliente principal - ele vira posição principal da nova posição
        const updatedMain = {
          ...main,
          position: newPosition,
          subPosition: 'a',
          subdivisionId: `${newPosition}-a`,
          isSubdivision: false
        };
        
        await client.zAdd(mainQueueKey, {
          score: newPosition,
          value: JSON.stringify(updatedMain)
        });
        
        console.log(`📍 ${main.nome}: ${oldPosition}${main.subPosition || ''} → ${newPosition}a (principal)`);
        
        newPosition++;
        
        // Subdivisões vão para a MESMA posição principal com subposições diferentes
        if (subs.length > 0) {
          // Primeira subdivisão vira posição principal da NOVA posição
          const firstSub = subs[0];
          const updatedMain = {
            ...firstSub,
            position: newPosition,
            subPosition: 'a',
            subdivisionId: `${newPosition}-a`,
            isSubdivision: false
          };
          
          await client.zAdd(mainQueueKey, {
            score: newPosition,
            value: JSON.stringify(updatedMain)
          });
          
          console.log(`📍 ${firstSub.nome}: ${oldPosition}${firstSub.subPosition || ''} → ${newPosition}a (PROMOVIDO a principal)`);
          
          // Demais subdivisões vão como subdivisões da MESMA posição
          for (let i = 1; i < subs.length; i++) {
            const subClient = subs[i];
            const updatedSub = {
              ...subClient,
              position: newPosition,
              subPosition: String.fromCharCode(97 + i), // b, c, d, etc.
              subdivisionId: `${newPosition}-${String.fromCharCode(97 + i)}`,
              isSubdivision: true
            };
            
            await client.zAdd(subQueueKey, {
              score: newPosition,
              value: JSON.stringify(updatedSub)
            });
            
            console.log(`📍 ${subClient.nome}: ${oldPosition}${subClient.subPosition || ''} → ${newPosition}${String.fromCharCode(97 + i)} (subdivisão)`);
          }
          
          newPosition++;
        }
      } else {
        // NÃO há cliente principal - primeira subdivisão vira principal
        if (subs.length > 0) {
          const firstSub = subs[0];
          const updatedMain = {
            ...firstSub,
            position: newPosition,
            subPosition: 'a',
            subdivisionId: `${newPosition}-a`,
            isSubdivision: false
          };
          
          await client.zAdd(mainQueueKey, {
            score: newPosition,
            value: JSON.stringify(updatedMain)
          });
          
          console.log(`📍 ${firstSub.nome}: ${oldPosition}${firstSub.subPosition || ''} → ${newPosition}a (PROMOVIDO de órfão)`);
          
          newPosition++;
          
          // Demais subdivisões vão para a MESMA posição principal com subposições diferentes
          if (subs.length > 1) {
            // Segunda subdivisão vira posição principal
            const secondSub = subs[1];
            const updatedMain = {
              ...secondSub,
              position: newPosition,
              subPosition: 'a',
              subdivisionId: `${newPosition}-a`,
              isSubdivision: false
            };
            
            await client.zAdd(mainQueueKey, {
              score: newPosition,
              value: JSON.stringify(updatedMain)
            });
            
            console.log(`📍 ${secondSub.nome}: ${oldPosition}${secondSub.subPosition || ''} → ${newPosition}a (PROMOVIDO a principal)`);
            
            // Demais subdivisões vão como subdivisões da MESMA posição
            for (let i = 2; i < subs.length; i++) {
              const subClient = subs[i];
              const updatedSub = {
                ...subClient,
                position: newPosition,
                subPosition: String.fromCharCode(97 + i - 1), // b, c, d, etc.
                subdivisionId: `${newPosition}-${String.fromCharCode(97 + i - 1)}`,
                isSubdivision: true
              };
              
              await client.zAdd(subQueueKey, {
                score: newPosition,
                value: JSON.stringify(updatedSub)
              });
              
              console.log(`📍 ${subClient.nome}: ${oldPosition}${subClient.subPosition || ''} → ${newPosition}${String.fromCharCode(97 + i - 1)} (subdivisão)`);
            }
            
            newPosition++;
          }
        }
      }
    }
    
    console.log(`✅ Movimento automático concluído - lógica correta de subdivisões`);
    
  } catch (error) {
    console.error('❌ Erro ao aplicar movimento automático:', error);
    throw new Error('Falha ao aplicar movimento automático');
  }
}

// Preenche lacuna deixada após avanço (NOVA ARQUITETURA)
async function fillGapAfterAdvance(queueId, gapPosition) {
  try {
    console.log(`🔍 Preenchendo lacuna na posição ${gapPosition}`);
    
    const client = await getRedisClient();
    if (!client) return;
    
    const mainQueueKey = getMainQueueKey(queueId);
    const subQueueKey = getSubdivisionQueueKey(queueId);
    
    // Obter todos os clientes da fila
    const mainClients = await client.zRangeWithScores(mainQueueKey, 0, -1);
    const subClients = await client.zRangeWithScores(subQueueKey, 0, -1);
    
    // Encontrar clientes que estão abaixo da lacuna (posição > gapPosition)
    const clientsToMove = [];
    
    // Processar clientes principais
    for (const item of mainClients) {
      try {
        const clientObj = JSON.parse(item.value);
        if (clientObj.position > gapPosition) {
          clientsToMove.push({
            ...clientObj,
            isSubdivision: false,
            score: item.score
          });
        }
      } catch (parseError) {
        console.warn('Erro ao processar cliente principal:', parseError);
      }
    }
    
    // Processar subdivisões
    for (const item of subClients) {
      try {
        const clientObj = JSON.parse(item.value);
        if (clientObj.position > gapPosition) {
          clientsToMove.push({
            ...clientObj,
            isSubdivision: true,
            score: item.score
          });
        }
      } catch (parseError) {
        console.warn('Erro ao processar subdivisão:', parseError);
      }
    }
    
    if (clientsToMove.length === 0) {
      console.log('📋 Nenhum cliente para mover');
      return;
    }
    
    // Ordenar clientes por posição atual
    clientsToMove.sort((a, b) => a.position - b.position);
    
    console.log(`📋 Movendo ${clientsToMove.length} clientes para preencher lacuna`);
    
    // Mover cada cliente uma posição para cima
    for (const clientToMove of clientsToMove) {
      const newPosition = clientToMove.position - 1;
      
      if (clientToMove.isSubdivision) {
        // Remover da fila de subdivisões
        await client.zRem(subQueueKey, JSON.stringify(clientToMove));
        
        // Adicionar na nova posição
        const updatedClient = {
          ...clientToMove,
          position: newPosition,
          subdivisionId: `${newPosition}-${clientToMove.subPosition}`
        };
        
        await client.zAdd(subQueueKey, {
          score: newPosition,
          value: JSON.stringify(updatedClient)
        });
        
        console.log(`📍 ${clientToMove.nome}: ${clientToMove.position}${clientToMove.subPosition} → ${newPosition}${clientToMove.subPosition} (subdivisão)`);
      } else {
        // Remover da fila principal
        await client.zRem(mainQueueKey, JSON.stringify(clientToMove));
        
        // Adicionar na nova posição
        const updatedClient = {
          ...clientToMove,
          position: newPosition,
          subdivisionId: `${newPosition}-a`
        };
        
        await client.zAdd(mainQueueKey, {
          score: newPosition,
          value: JSON.stringify(updatedClient)
        });
        
        console.log(`📍 ${clientToMove.nome}: ${clientToMove.position}a → ${newPosition}a (principal)`);
      }
    }
    
    console.log(`✅ Lacuna na posição ${gapPosition} preenchida`);
    
  } catch (error) {
    console.error('❌ Erro ao preencher lacuna:', error);
    throw new Error('Falha ao preencher lacuna');
  }
}

// Avança cliente com sistema de aluguel de posição (NOVA ARQUITETURA)
async function advanceClientWithRental(queueId, client, positions) {
  try {
    console.log(`🔍 Avançando cliente ${client.nome} com sistema de aluguel - ${positions} posições (nova arquitetura)`);
    
    const currentPosition = client.position;
    
    // REGRAS DE AVANÇO:
    // 1. Top 3 posições são BLOQUEADAS (1, 2, 3)
    // 2. Posição mínima possível = 4 (primeira não bloqueada)
    // 3. Só pode avançar para CIMA (nunca para baixo)
    
    if (currentPosition <= 3) {
      throw new Error('❌ Posições 1, 2 e 3 são bloqueadas - não é possível avançar');
    }
    
    // Calcular posição desejada
    const desiredPosition = Math.max(4, currentPosition - positions);
    
    // Verificar se realmente avançou
    if (desiredPosition >= currentPosition) {
      throw new Error('❌ Não é possível avançar - posição mínima é 4');
    }
    
    const newPosition = desiredPosition;
    
    console.log(`📍 Posição atual: ${currentPosition}, Posição desejada: ${desiredPosition}, Nova posição: ${newPosition}`);
    
    // 1. Remover cliente da fila
    await removeClientFromQueue(queueId, client);
    
    // 2. Atualizar dados do cliente com informações de pagamento
    const updatedClient = {
      ...client,
      position: newPosition,
      paidAdvance: true,
      paymentTimestamp: Date.now(),
      rentalPosition: true
    };
    
    // 3. Adicionar cliente à nova posição (cria estrutura bidimensional)
    const success = await addClientToQueue(queueId, newPosition, updatedClient);
    
    if (success) {
      // 4. Preencher lacuna deixada na posição original
      console.log(`🔄 Preenchendo lacuna na posição ${currentPosition}`);
      await fillGapAfterAdvance(queueId, currentPosition);
      
      console.log(`✅ Cliente ${client.nome} avançou da posição ${currentPosition} para ${newPosition}`);
      return {
        success: true,
        oldPosition: currentPosition,
        newPosition: newPosition,
        positionsAdvanced: currentPosition - newPosition,
        rentalPosition: true
      };
    } else {
      throw new Error('Falha ao avançar cliente');
    }
  } catch (error) {
    console.error('❌ Erro ao alugar posição:', error);
    throw new Error('Falha ao alugar posição');
  }
}

// Obtém clientes agrupados por posição (NOVA ARQUITETURA)
async function getQueueClientsGrouped(queueId) {
  try {
    console.log(`🔍 getQueueClientsGrouped - queueId: ${queueId} (nova arquitetura)`);
    
    const allClients = await getQueueClients(queueId);
    console.log(`📋 Clientes obtidos:`, allClients.map(c => ({ nome: c.nome, position: c.position, subPosition: c.subPosition })));
    
    const groupedClients = {};
    
    // Agrupar clientes por posição principal
    for (const client of allClients) {
      const position = client.position;
      if (!groupedClients[position]) {
        groupedClients[position] = [];
      }
      groupedClients[position].push(client);
    }
    
    console.log(`📊 Clientes agrupados:`, Object.keys(groupedClients).map(pos => `${pos}: ${groupedClients[pos].length} clientes`));
    
    // Ordenar clientes dentro de cada posição por prioridade de pagamento
    for (const position in groupedClients) {
      groupedClients[position].sort((a, b) => {
        // LÓGICA CORRETA: Clientes que NÃO pagaram têm prioridade (entraram primeiro)
        // Clientes que pagaram para avançar ficam por último na subposição
        if (!a.paidAdvance && b.paidAdvance) return -1; // a não pagou, b pagou -> a primeiro
        if (a.paidAdvance && !b.paidAdvance) return 1;  // a pagou, b não pagou -> b primeiro
        
        // Se ambos não pagaram, ordem de chegada (timestamp)
        if (!a.paidAdvance && !b.paidAdvance) {
          const aTimestamp = a.timestamp || 0;
          const bTimestamp = b.timestamp || 0;
          return aTimestamp - bTimestamp; // Mais antigo primeiro
        }
        
        // Se ambos pagaram, quem pagou mais cedo tem prioridade
        if (a.paidAdvance && b.paidAdvance) {
          const aTimestamp = a.paymentTimestamp || 0;
          const bTimestamp = b.paymentTimestamp || 0;
          return aTimestamp - bTimestamp; // Mais antigo primeiro
        }
        
        return 0;
      });
      
      // Atribuir subposições (a, b, c, etc.)
      groupedClients[position].forEach((client, index) => {
        const subPosition = String.fromCharCode(97 + index); // a, b, c, etc.
        client.subPosition = subPosition;
      });
    }
    
    console.log(`✅ Estrutura bidimensional criada:`, Object.keys(groupedClients).map(pos => 
      `${pos}: ${groupedClients[pos].map(c => `${c.nome}(${c.subPosition})`).join(', ')}`
    ));
    
    return groupedClients;
  } catch (error) {
    console.error('❌ Erro ao obter clientes agrupados:', error);
    throw new Error('Falha ao obter clientes agrupados');
  }
}

// Obtém tamanho da fila
async function getQueueSize(queueId) {
  try {
    const clients = await getQueueClients(queueId);
    return clients.length;
  } catch (error) {
    console.error('Erro ao obter tamanho da fila:', error);
    throw new Error('Falha ao obter tamanho da fila');
  }
}

// Deleta toda a fila
async function deleteQueue(queueId) {
  try {
    const client = await getRedisClient();
    if (!client) return true;
    
    const mainQueueKey = getMainQueueKey(queueId);
    const subQueueKey = getSubdivisionQueueKey(queueId);
    const metaKey = getQueueMetaKey(queueId);
    const statsKey = getQueueStatsKey(queueId);
    
    await client.del([mainQueueKey, subQueueKey, metaKey, statsKey]);
    
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
    if (!client) return true;
    
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
    if (!client) return {};
    
    const metaKey = getQueueMetaKey(queueId);
    const metadata = await client.hGetAll(metaKey);
    return metadata;
  } catch (error) {
    console.error('Erro ao obter metadados da fila:', error);
    throw new Error('Falha ao obter metadados da fila');
  }
}

// Busca próximo grupo adequado para mesa específica
async function getNextGroupForTable(queueId, tableCapacity) {
  try {
    console.log(`🔍 Buscando grupo adequado para mesa de ${tableCapacity} lugares na fila ${queueId}`);
    
    const allClients = await getQueueClients(queueId);
    if (!allClients || allClients.length === 0) {
      console.log('📋 Fila vazia');
      return null;
    }
    
    // Definir intervalos exclusivos por capacidade de mesa
    let minCapacity, maxCapacity;
    switch (tableCapacity) {
      case 2:
        minCapacity = 1;
        maxCapacity = 2;
        break;
      case 4:
        minCapacity = 3;
        maxCapacity = 4;
        break;
      case 6:
        minCapacity = 5;
        maxCapacity = 6;
        break;
      case 8:
        minCapacity = 7;
        maxCapacity = 8;
        break;
      default:
        minCapacity = 1;
        maxCapacity = tableCapacity;
    }
    
    console.log(`📊 Intervalo da mesa ${tableCapacity}: ${minCapacity}-${maxCapacity} pessoas`);
    
    // Buscar grupos que cabem no intervalo exclusivo da mesa
    const suitableGroups = allClients.filter(client => {
      // Verificar se é um grupo
      if (client.tipo !== 'grupo' && !client.isGroupLeader) {
        return false;
      }
      
      // Verificar se o tamanho do grupo cabe no intervalo exclusivo da mesa
      const groupSize = client.groupSize || 1;
      const fitsInInterval = groupSize >= minCapacity && groupSize <= maxCapacity;
      
      console.log(`🔍 Grupo ${client.nome}: ${groupSize} pessoas - ${fitsInInterval ? '✅' : '❌'} (intervalo: ${minCapacity}-${maxCapacity})`);
      
      return fitsInInterval;
    });
    
    if (suitableGroups.length === 0) {
      console.log(`❌ Nenhum grupo adequado para mesa de ${tableCapacity} lugares (intervalo exclusivo: ${minCapacity}-${maxCapacity})`);
      return null;
    }
    
    // Ordenar por posição (primeiro da fila)
    suitableGroups.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position;
      }
      return (a.subPosition || 'a').localeCompare(b.subPosition || 'a');
    });
    
    const selectedGroup = suitableGroups[0];
    console.log(`✅ Grupo selecionado: ${selectedGroup.nome} (${selectedGroup.groupSize} pessoas) na posição ${selectedGroup.position}${selectedGroup.subPosition}`);
    
    return selectedGroup;
    
  } catch (error) {
    console.error('❌ Erro ao buscar grupo para mesa:', error);
    throw new Error('Falha ao buscar grupo para mesa');
  }
}

export {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  isRedisAvailable,
  getMainQueueKey,
  getSubdivisionQueueKey,
  getQueueMetaKey,
  getQueueStatsKey,
  addClientToQueue,
  removeClientFromQueue,
  getQueueClients,
  getQueueSize,
  deleteQueue,
  setQueueMetadata,
  getQueueMetadata,
  getNextClient,
  getQueueClientsGrouped,
  advanceClientWithRental,
  callNextClientWithAutoMove,
  applyAutoMove,
  fillGapAfterAdvance,
  getNextGroupForTable
};

// Export default para compatibilidade
export default {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  isRedisAvailable,
  getMainQueueKey,
  getSubdivisionQueueKey,
  getQueueMetaKey,
  getQueueStatsKey,
  addClientToQueue,
  removeClientFromQueue,
  getQueueClients,
  getQueueSize,
  deleteQueue,
  setQueueMetadata,
  getQueueMetadata,
  getNextClient,
  getQueueClientsGrouped,
  advanceClientWithRental,
  callNextClientWithAutoMove,
  applyAutoMove,
  fillGapAfterAdvance,
  getNextGroupForTable
};