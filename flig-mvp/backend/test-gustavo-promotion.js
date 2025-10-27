/**
 * TESTE ESPECÍFICO: Verificar por que Gustavo não está sendo promovido
 * 
 * Este script testa especificamente o cenário onde Gustavo deveria ser promovido
 * de subdivisão órfã para posição principal.
 */

import redisService from './services/redis.js';

// Função auxiliar para imprimir estado detalhado
function printDetailedState(step, description, clients) {
  console.log(`\n=== ${step} — ${description} ===`);
  
  if (!clients || clients.length === 0) {
    console.log('Fila vazia');
    return;
  }
  
  console.log('| Pos | Pessoa/Grupo | Subposição | Fila | Status |');
  console.log('| --- | ------------ | ---------- | ---- | ------ |');
  
  clients.forEach(client => {
    const displayName = client.tipo === 'grupo' ? `Grupo ${client.nome}` : client.nome;
    const queueType = client.isSubdivision ? 'Sub' : 'Main';
    const status = client.isSubdivision ? 'Órfã?' : 'Principal';
    console.log(`| ${client.position} | ${displayName} | - ${client.position}${client.subPosition} | ${queueType} | ${status} |`);
  });
}

async function testGustavoPromotion() {
  try {
    console.log('🔍 TESTE ESPECÍFICO: Por que Gustavo não está sendo promovido?');
    console.log('============================================================');
    
    // Conectar ao Redis
    await redisService.connectRedis();
    
    const queueId = 'test-gustavo-promotion';
    
    // Limpar fila anterior se existir
    await redisService.deleteQueue(queueId);
    
    // === CRIAR CENÁRIO ESPECÍFICO ===
    console.log('\n📋 Criando cenário específico...');
    
    const clients = [
      { id: 'ana', nome: 'Ana', email: 'ana@test.com', telefone: '111111111' },
      { id: 'bruno', nome: 'Bruno', email: 'bruno@test.com', telefone: '222222222' },
      { id: 'carla', nome: 'Carla', email: 'carla@test.com', telefone: '333333333' },
      { id: 'gustavo', nome: 'Gustavo', email: 'gustavo@test.com', telefone: '666666666' }
    ];
    
    // Adicionar clientes à fila
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      await redisService.addClientToQueue(queueId, i + 1, client, 'a');
    }
    
    const clientsAfterInit = await redisService.getQueueClients(queueId);
    printDetailedState('Estado Inicial', 'Fila criada', clientsAfterInit);
    
    // Gustavo avança para posição 3 (onde já está Carla)
    const gustavo = clientsAfterInit.find(c => c.nome === 'Gustavo');
    await redisService.advanceClientWithRental(queueId, gustavo, 1);
    
    const clientsAfterAdvance = await redisService.getQueueClients(queueId);
    printDetailedState('Após Avanço', 'Gustavo avança para posição 3', clientsAfterAdvance);
    
    // === CHAMAR ANA E ANALISAR ===
    console.log('\n📞 Chamando Ana...');
    await redisService.removeClientFromQueue(queueId, clientsAfterAdvance.find(c => c.nome === 'Ana'));
    
    const clientsAfterRemoval = await redisService.getQueueClients(queueId);
    printDetailedState('Após Remoção', 'Ana removida', clientsAfterRemoval);
    
    console.log('\n🔍 ANÁLISE ANTES DO MOVIMENTO AUTOMÁTICO:');
    console.log('==========================================');
    
    const client = await redisService.getRedisClient();
    const mainQueueKey = redisService.getMainQueueKey(queueId);
    const subQueueKey = redisService.getSubdivisionQueueKey(queueId);
    
    const mainClients = await client.zRangeWithScores(mainQueueKey, 0, -1);
    const subClients = await client.zRangeWithScores(subQueueKey, 0, -1);
    
    console.log(`📋 Fila Principal: ${mainClients.length} clientes`);
    mainClients.forEach(item => {
      const clientObj = JSON.parse(item.value);
      console.log(`   - ${clientObj.nome}: posição ${clientObj.position}${clientObj.subPosition} (${clientObj.isSubdivision ? 'Sub' : 'Main'})`);
    });
    
    console.log(`📋 Fila Subdivisões: ${subClients.length} clientes`);
    subClients.forEach(item => {
      const clientObj = JSON.parse(item.value);
      console.log(`   - ${clientObj.nome}: posição ${clientObj.position}${clientObj.subPosition} (${clientObj.isSubdivision ? 'Sub' : 'Main'})`);
    });
    
    // Aplicar movimento automático
    console.log('\n🔄 Aplicando movimento automático...');
    await redisService.applyAutoMove(queueId);
    
    const clientsAfterAutoMove = await redisService.getQueueClients(queueId);
    printDetailedState('Após AutoMove', 'Movimento automático aplicado', clientsAfterAutoMove);
    
    // === ANÁLISE DO RESULTADO ===
    console.log('\n🔍 ANÁLISE DO RESULTADO:');
    console.log('========================');
    
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
    
    // Limpar fila de teste
    await redisService.deleteQueue(queueId);
    console.log('\n🧹 Fila de teste limpa');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Desconectar do Redis
    await redisService.disconnectRedis();
  }
}

// Executar teste se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testGustavoPromotion()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default testGustavoPromotion;
