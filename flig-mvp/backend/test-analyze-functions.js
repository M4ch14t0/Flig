/**
 * ANÁLISE DETALHADA: Como funcionam as funções de chamada e movimento automático
 * 
 * Este script destrincha exatamente o que cada função faz:
 * 1. callNextClientWithAutoMove - função que chama clientes
 * 2. applyAutoMove - função que reorganiza a fila após chamada
 */

import redisService from './services/redis.js';

// Função auxiliar para imprimir estado detalhado
function printDetailedState(step, description, clients) {
  console.log(`\n=== ${step} — ${description} ===`);
  
  if (!clients || clients.length === 0) {
    console.log('Fila vazia');
    return;
  }
  
  console.log('| Pos | Pessoa/Grupo | Subposição | Fila | ID |');
  console.log('| --- | ------------ | ---------- | ---- | -- |');
  
  clients.forEach(client => {
    const displayName = client.tipo === 'grupo' ? `Grupo ${client.nome}` : client.nome;
    const queueType = client.isSubdivision ? 'Sub' : 'Main';
    console.log(`| ${client.position} | ${displayName} | - ${client.position}${client.subPosition} | ${queueType} | ${client.id} |`);
  });
}

async function analyzeCallFunctions() {
  try {
    console.log('🔍 ANÁLISE DETALHADA: Funções de Chamada e Movimento Automático');
    console.log('================================================================');
    
    // Conectar ao Redis
    await redisService.connectRedis();
    
    const queueId = 'test-analysis';
    
    // Limpar fila anterior se existir
    await redisService.deleteQueue(queueId);
    
    // === CRIAR CENÁRIO ESPECÍFICO ===
    console.log('\n📋 Criando cenário específico para análise...');
    
    const clients = [
      { id: 'ana', nome: 'Ana', email: 'ana@test.com', telefone: '111111111' },
      { id: 'bruno', nome: 'Bruno', email: 'bruno@test.com', telefone: '222222222' },
      { id: 'carla', nome: 'Carla', email: 'carla@test.com', telefone: '333333333' },
      { id: 'grupo-silva', nome: 'Silva', email: 'silva@test.com', telefone: '444444444', tipo: 'grupo', isGroupLeader: true, groupSize: 4 },
      { id: 'gustavo', nome: 'Gustavo', email: 'gustavo@test.com', telefone: '666666666' }
    ];
    
    // Adicionar clientes à fila
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      await redisService.addClientToQueue(queueId, i + 1, client, 'a');
    }
    
    const clientsAfterInit = await redisService.getQueueClients(queueId);
    printDetailedState('Estado Inicial', 'Fila criada', clientsAfterInit);
    
    // === GUSTAVO AVANÇA (5 → 4) ===
    console.log('\n🔄 GUSTAVO AVANÇA (5 → 4)');
    console.log('==========================');
    
    const gustavo = clientsAfterInit.find(c => c.nome === 'Gustavo');
    console.log(`📍 Gustavo atual: posição ${gustavo.position}${gustavo.subPosition}`);
    
    await redisService.advanceClientWithRental(queueId, gustavo, 1);
    
    const clientsAfterAdvance = await redisService.getQueueClients(queueId);
    printDetailedState('Após Avanço', 'Gustavo avança 1 posição (5 → 4)', clientsAfterAdvance);
    
    // === ANÁLISE DETALHADA DAS FUNÇÕES ===
    console.log('\n🔍 ANÁLISE DETALHADA DAS FUNÇÕES');
    console.log('==================================');
    
    console.log('\n📞 FUNÇÃO: callNextClientWithAutoMove');
    console.log('------------------------------------');
    console.log('Esta função faz 3 coisas:');
    console.log('1. getNextClient() - Busca o primeiro cliente da fila principal');
    console.log('2. removeClientFromQueue() - Remove o cliente da fila');
    console.log('3. applyAutoMove() - Reorganiza todos os clientes restantes');
    
    console.log('\n🔄 FUNÇÃO: applyAutoMove');
    console.log('------------------------');
    console.log('Esta função faz o seguinte:');
    console.log('1. Obtém TODOS os clientes (main + sub)');
    console.log('2. LIMPA ambas as filas (main + sub)');
    console.log('3. Reorganiza COMPLETAMENTE a fila');
    console.log('4. Para cada posição principal:');
    console.log('   - Se há subdivisões: primeiro vira "a", demais vão para "b", "c", etc.');
    console.log('   - Se não há subdivisões: move normalmente');
    console.log('5. Processa subdivisões órfãs (sem posição principal)');
    
    // === EXECUTAR CHAMADA E ANALISAR PASSO A PASSO ===
    console.log('\n📞 EXECUTANDO CHAMADA: Ana');
    console.log('==========================');
    
    console.log('\n🔍 PASSO 1: getNextClient()');
    const nextClient = await redisService.getNextClient(queueId);
    console.log(`📞 Próximo cliente encontrado: ${nextClient.nome} (posição ${nextClient.position}${nextClient.subPosition})`);
    console.log(`📊 Tipo: ${nextClient.isSubdivision ? 'Subdivisão' : 'Principal'}`);
    
    console.log('\n🔍 PASSO 2: removeClientFromQueue()');
    await redisService.removeClientFromQueue(queueId, nextClient);
    console.log(`✅ Cliente ${nextClient.nome} removido da fila`);
    
    const clientsAfterRemoval = await redisService.getQueueClients(queueId);
    printDetailedState('Após Remoção', 'Ana removida, veja o que sobrou', clientsAfterRemoval);
    
    console.log('\n🔍 PASSO 3: applyAutoMove() - ANÁLISE DETALHADA');
    console.log('===============================================');
    
    // Obter clientes antes do movimento automático
    const client = await redisService.getRedisClient();
    const mainQueueKey = redisService.getMainQueueKey(queueId);
    const subQueueKey = redisService.getSubdivisionQueueKey(queueId);
    
    const mainClients = await client.zRangeWithScores(mainQueueKey, 0, -1);
    const subClients = await client.zRangeWithScores(subQueueKey, 0, -1);
    
    console.log(`📋 ANTES do applyAutoMove:`);
    console.log(`   - Fila Principal: ${mainClients.length} clientes`);
    console.log(`   - Fila Subdivisões: ${subClients.length} clientes`);
    
    mainClients.forEach(item => {
      const clientObj = JSON.parse(item.value);
      console.log(`   - Main: ${clientObj.nome} (${clientObj.position}${clientObj.subPosition})`);
    });
    
    subClients.forEach(item => {
      const clientObj = JSON.parse(item.value);
      console.log(`   - Sub: ${clientObj.nome} (${clientObj.position}${clientObj.subPosition})`);
    });
    
    console.log('\n🔄 EXECUTANDO applyAutoMove()...');
    await redisService.applyAutoMove(queueId);
    
    const clientsAfterAutoMove = await redisService.getQueueClients(queueId);
    printDetailedState('Após AutoMove', 'Movimento automático aplicado', clientsAfterAutoMove);
    
    // === ANÁLISE DO PROBLEMA ===
    console.log('\n❌ ANÁLISE DO PROBLEMA');
    console.log('======================');
    
    const gustavoAfter = clientsAfterAutoMove.find(c => c.nome === 'Gustavo');
    if (gustavoAfter) {
      console.log(`📍 Gustavo após movimento: ${gustavoAfter.position}${gustavoAfter.subPosition} (${gustavoAfter.isSubdivision ? 'Subdivisão' : 'Principal'})`);
      
      if (gustavoAfter.isSubdivision) {
        console.log('❌ PROBLEMA: Gustavo ainda está como subdivisão!');
        console.log('✅ DEVERIA: Gustavo deveria ser promovido para posição principal');
      } else {
        console.log('✅ CORRETO: Gustavo foi promovido para posição principal');
      }
    } else {
      console.log('❌ PROBLEMA: Gustavo não foi encontrado na fila!');
    }
    
    console.log('\n🔍 CAUSA RAIZ DO PROBLEMA:');
    console.log('==========================');
    console.log('A função applyAutoMove está processando clientes da fila principal PRIMEIRO,');
    console.log('mas não está verificando se há subdivisões órfãs que precisam ser promovidas.');
    console.log('Gustavo está na posição 4 como subdivisão, mas não há cliente principal na posição 4.');
    console.log('Ele deveria ser promovido para posição principal.');
    
    // Limpar fila de teste
    await redisService.deleteQueue(queueId);
    console.log('\n🧹 Fila de teste limpa');
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Desconectar do Redis
    await redisService.disconnectRedis();
  }
}

// Executar análise se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeCallFunctions()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default analyzeCallFunctions;
