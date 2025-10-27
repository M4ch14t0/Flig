/**
 * TESTE DA SIMULAÇÃO COMPLETA: Verificar se a função applyAutoMove está funcionando
 * 
 * Este script testa exatamente o cenário da simulação fornecida pelo usuário.
 */

import redisService from './services/redis.js';

// Função auxiliar para imprimir estado detalhado
function printDetailedState(step, description, clients) {
  console.log(`\n=== ${step} — ${description} ===`);
  
  if (!clients || clients.length === 0) {
    console.log('Fila vazia');
    return;
  }
  
  console.log('| Pos | Pessoa/Grupo | Subposição | Fila |');
  console.log('| --- | ------------ | ---------- | ---- |');
  
  clients.forEach(client => {
    const displayName = client.tipo === 'grupo' ? `Grupo ${client.nome}` : client.nome;
    const queueType = client.isSubdivision ? 'Sub' : 'Main';
    console.log(`| ${client.position} | ${displayName} | - ${client.position}${client.subPosition} | ${queueType} |`);
  });
}

async function testCompleteSimulation() {
  try {
    console.log('🔍 TESTE DA SIMULAÇÃO COMPLETA');
    console.log('==============================');
    
    // Conectar ao Redis
    await redisService.connectRedis();
    
    const queueId = 'test-complete-simulation';
    
    // Limpar fila anterior se existir
    await redisService.deleteQueue(queueId);
    
    // === CRIAR CENÁRIO EXATO DA SIMULAÇÃO ===
    console.log('\n📋 Criando cenário exato da simulação...');
    
    // Adicionar clientes diretamente às filas para simular o estado exato
    const client = await redisService.getRedisClient();
    const mainQueueKey = redisService.getMainQueueKey(queueId);
    const subQueueKey = redisService.getSubdivisionQueueKey(queueId);
    
    // Estado inicial: Ana, Bruno, Carla, Grupo Silva, Gustavo
    const clients = [
      { id: 'ana', nome: 'Ana', email: 'ana@test.com', telefone: '111111111' },
      { id: 'bruno', nome: 'Bruno', email: 'bruno@test.com', telefone: '222222222' },
      { id: 'carla', nome: 'Carla', email: 'carla@test.com', telefone: '333333333' },
      { id: 'grupo-silva', nome: 'Silva', email: 'silva@test.com', telefone: '444444444', tipo: 'grupo', isGroupLeader: true, groupSize: 4 },
      { id: 'gustavo', nome: 'Gustavo', email: 'gustavo@test.com', telefone: '666666666' }
    ];
    
    // Adicionar clientes à fila
    for (let i = 0; i < clients.length; i++) {
      const clientData = clients[i];
      await redisService.addClientToQueue(queueId, i + 1, clientData, 'a');
    }
    
    const clientsAfterInit = await redisService.getQueueClients(queueId);
    printDetailedState('Estado Inicial', 'Fila criada', clientsAfterInit);
    
    // === GUSTAVO AVANÇA (6 → 4) ===
    console.log('\n🔄 GUSTAVO AVANÇA (6 → 4)');
    console.log('==========================');
    
    const gustavo = clientsAfterInit.find(c => c.nome === 'Gustavo');
    await redisService.advanceClientWithRental(queueId, gustavo, 1);
    
    const clientsAfterAdvance = await redisService.getQueueClients(queueId);
    printDetailedState('Após Avanço', 'Gustavo avança 1 posição (5 → 4)', clientsAfterAdvance);
    
    // === CHAMADA: ANA ===
    console.log('\n📞 CHAMADA: Ana');
    console.log('===============');
    
    // Chamar Ana
    await redisService.removeClientFromQueue(queueId, clientsAfterAdvance.find(c => c.nome === 'Ana'));
    
    const clientsAfterRemoval = await redisService.getQueueClients(queueId);
    printDetailedState('Após Remoção', 'Ana removida', clientsAfterRemoval);
    
    // Aplicar movimento automático
    console.log('\n🔄 Aplicando movimento automático...');
    await redisService.applyAutoMove(queueId);
    
    const clientsAfterAutoMove = await redisService.getQueueClients(queueId);
    printDetailedState('Após AutoMove', 'Movimento automático aplicado', clientsAfterAutoMove);
    
    // === ANÁLISE DO RESULTADO ===
    console.log('\n🔍 ANÁLISE DO RESULTADO:');
    console.log('========================');
    
    console.log('\n📊 RESULTADO OBTIDO:');
    clientsAfterAutoMove.forEach(client => {
      const queueType = client.isSubdivision ? 'Subdivisão' : 'Principal';
      console.log(`- ${client.nome}: posição ${client.position}${client.subPosition} (${queueType})`);
    });
    
    console.log('\n🎯 RESULTADO ESPERADO (segundo sua simulação):');
    console.log('- Bruno: 1a (Principal)');
    console.log('- Carla: 2a (Principal)');
    console.log('- Grupo Silva: 3a (Principal)');
    console.log('- Gustavo: 4a (Principal)');
    
    // Verificar se está correto
    const bruno = clientsAfterAutoMove.find(c => c.nome === 'Bruno');
    const carla = clientsAfterAutoMove.find(c => c.nome === 'Carla');
    const silva = clientsAfterAutoMove.find(c => c.nome === 'Silva');
    const gustavoAfter = clientsAfterAutoMove.find(c => c.nome === 'Gustavo');
    
    let isCorrect = true;
    
    if (bruno && bruno.position === 1 && bruno.subPosition === 'a' && !bruno.isSubdivision) {
      console.log('✅ Bruno: CORRETO');
    } else {
      console.log('❌ Bruno: INCORRETO');
      isCorrect = false;
    }
    
    if (carla && carla.position === 2 && carla.subPosition === 'a' && !carla.isSubdivision) {
      console.log('✅ Carla: CORRETO');
    } else {
      console.log('❌ Carla: INCORRETO');
      isCorrect = false;
    }
    
    if (silva && silva.position === 3 && silva.subPosition === 'a' && !silva.isSubdivision) {
      console.log('✅ Grupo Silva: CORRETO');
    } else {
      console.log('❌ Grupo Silva: INCORRETO');
      isCorrect = false;
    }
    
    if (gustavoAfter && gustavoAfter.position === 4 && gustavoAfter.subPosition === 'a' && !gustavoAfter.isSubdivision) {
      console.log('✅ Gustavo: CORRETO (promovido para posição principal)');
    } else {
      console.log('❌ Gustavo: INCORRETO');
      isCorrect = false;
    }
    
    if (isCorrect) {
      console.log('\n🎉 SUCESSO: A fila está funcionando corretamente!');
    } else {
      console.log('\n❌ FALHA: A fila ainda não está funcionando corretamente');
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
  testCompleteSimulation()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default testCompleteSimulation;
