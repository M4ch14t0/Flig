/**
 * TESTE COMPLETO: Fila com Avanços e Chamadas
 * 
 * Este script demonstra uma fila completa realizando:
 * 1. Criação da fila
 * 2. Avanços de posições
 * 3. Chamadas de clientes
 * 4. Estado inicial vs final
 */

import redisService from './services/redis.js';

// Função auxiliar para imprimir estado da fila
function printQueueState(step, description, clients) {
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

async function testCompleteQueue() {
  try {
    console.log('🔍 TESTE COMPLETO: Fila com Avanços e Chamadas');
    console.log('==============================================');
    
    // Conectar ao Redis
    await redisService.connectRedis();
    
    const queueId = 'test-complete-queue';
    
    // Limpar fila anterior se existir
    await redisService.deleteQueue(queueId);
    
    // === ESTADO INICIAL ===
    console.log('\n📋 CRIANDO FILA INICIAL');
    console.log('========================');
    
    const initialClients = [
      { id: 'ana', nome: 'Ana', email: 'ana@test.com', telefone: '111111111' },
      { id: 'bruno', nome: 'Bruno', email: 'bruno@test.com', telefone: '222222222' },
      { id: 'carla', nome: 'Carla', email: 'carla@test.com', telefone: '333333333' },
      { id: 'diego', nome: 'Diego', email: 'diego@test.com', telefone: '444444444' },
      { id: 'elena', nome: 'Elena', email: 'elena@test.com', telefone: '555555555' },
      { id: 'fernando', nome: 'Fernando', email: 'fernando@test.com', telefone: '666666666' },
      { id: 'gabriela', nome: 'Gabriela', email: 'gabriela@test.com', telefone: '777777777' },
      { id: 'henrique', nome: 'Henrique', email: 'henrique@test.com', telefone: '888888888' },
      { id: 'isabela', nome: 'Isabela', email: 'isabela@test.com', telefone: '999999999' },
      { id: 'joao', nome: 'João', email: 'joao@test.com', telefone: '101010101' }
    ];
    
    // Adicionar clientes à fila
    for (let i = 0; i < initialClients.length; i++) {
      const client = initialClients[i];
      await redisService.addClientToQueue(queueId, i + 1, client, 'a');
    }
    
    const clientsAfterInit = await redisService.getQueueClients(queueId);
    printQueueState('ESTADO INICIAL', 'Fila criada com 10 clientes', clientsAfterInit);
    
    // === AVANÇOS DE POSIÇÕES ===
    console.log('\n🔄 REALIZANDO AVANÇOS DE POSIÇÕES');
    console.log('==================================');
    
    // Fernando avança 3 posições (6 → 3)
    console.log('\n📍 EVENTO 1: Fernando avança 3 posições (6 → 3)');
    const fernando = clientsAfterInit.find(c => c.nome === 'Fernando');
    await redisService.advanceClientWithRental(queueId, fernando, 3);
    
    const clientsAfterAdvance1 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 1', 'Fernando avança 3 posições', clientsAfterAdvance1);
    
    // Gabriela avança 2 posições (7 → 5)
    console.log('\n📍 EVENTO 2: Gabriela avança 2 posições (7 → 5)');
    const gabriela = clientsAfterAdvance1.find(c => c.nome === 'Gabriela');
    await redisService.advanceClientWithRental(queueId, gabriela, 2);
    
    const clientsAfterAdvance2 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 2', 'Gabriela avança 2 posições', clientsAfterAdvance2);
    
    // Henrique avança 4 posições (8 → 4)
    console.log('\n📍 EVENTO 3: Henrique avança 4 posições (8 → 4)');
    const henrique = clientsAfterAdvance2.find(c => c.nome === 'Henrique');
    await redisService.advanceClientWithRental(queueId, henrique, 4);
    
    const clientsAfterAdvance3 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 3', 'Henrique avança 4 posições', clientsAfterAdvance3);
    
    // === CHAMADAS DE CLIENTES ===
    console.log('\n📞 REALIZANDO CHAMADAS DE CLIENTES');
    console.log('===================================');
    
    // Chamada 1: Ana
    console.log('\n📞 EVENTO 4: Chamada de Ana');
    const ana = clientsAfterAdvance3.find(c => c.nome === 'Ana');
    await redisService.removeClientFromQueue(queueId, ana);
    await redisService.applyAutoMove(queueId);
    
    const clientsAfterCall1 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 4', 'Ana foi chamada', clientsAfterCall1);
    
    // Chamada 2: Bruno
    console.log('\n📞 EVENTO 5: Chamada de Bruno');
    const bruno = clientsAfterCall1.find(c => c.nome === 'Bruno');
    await redisService.removeClientFromQueue(queueId, bruno);
    await redisService.applyAutoMove(queueId);
    
    const clientsAfterCall2 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 5', 'Bruno foi chamado', clientsAfterCall2);
    
    // Chamada 3: Fernando (que havia avançado)
    console.log('\n📞 EVENTO 6: Chamada de Fernando (que havia avançado)');
    const fernandoAfter = clientsAfterCall2.find(c => c.nome === 'Fernando');
    await redisService.removeClientFromQueue(queueId, fernandoAfter);
    await redisService.applyAutoMove(queueId);
    
    const clientsAfterCall3 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 6', 'Fernando foi chamado', clientsAfterCall3);
    
    // === RESUMO FINAL ===
    console.log('\n📊 RESUMO FINAL');
    console.log('================');
    
    const finalClients = await redisService.getQueueClients(queueId);
    
    console.log('\n📋 ESTADO FINAL (7 clientes restantes):');
    finalClients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.nome} - posição ${client.position}${client.subPosition} (${client.isSubdivision ? 'Subdivisão' : 'Principal'})`);
    });
    
    console.log('\n📊 RESUMO DAS OPERAÇÕES:');
    console.log('========================');
    console.log('✅ Clientes adicionados: 10');
    console.log('🔄 Avanços realizados: 3');
    console.log('📞 Chamadas realizadas: 3');
    console.log('👥 Clientes restantes: 7');
    console.log('🚪 Clientes atendidos: 3');
    
    console.log('\n🎯 CLIENTES ATENDIDOS:');
    console.log('- Ana (posição inicial: 1)');
    console.log('- Bruno (posição inicial: 2)');
    console.log('- Fernando (posição inicial: 6, avançou para 3)');
    
    console.log('\n🔄 CLIENTES QUE AVANÇARAM:');
    console.log('- Fernando: 6 → 3 (avançou 3 posições)');
    console.log('- Gabriela: 7 → 5 (avançou 2 posições)');
    console.log('- Henrique: 8 → 4 (avançou 4 posições)');
    
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
  testCompleteQueue()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default testCompleteQueue;
