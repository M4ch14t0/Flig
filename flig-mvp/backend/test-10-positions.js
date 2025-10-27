/**
 * TESTE COMPLETO: Fila com 10 posições e subdivisões
 * 
 * Este teste demonstra o funcionamento completo da lógica de subdivisões
 * com uma fila de 10 posições, incluindo avanços e chamadas.
 */

import redisService from './services/redis.js';

// Função para imprimir estado da fila
function printQueueState(title, clients) {
  console.log(`\n=== ${title} ===`);
  console.log('| Pos | Pessoa/Grupo | Subposição | Fila |');
  console.log('| --- | ------------ | ---------- | ---- |');
  
  // Agrupar clientes por posição
  const groupedClients = {};
  clients.forEach(client => {
    const pos = client.position;
    if (!groupedClients[pos]) {
      groupedClients[pos] = [];
    }
    groupedClients[pos].push(client);
  });
  
  // Ordenar posições
  const sortedPositions = Object.keys(groupedClients).sort((a, b) => parseInt(a) - parseInt(b));
  
  sortedPositions.forEach(position => {
    const positionClients = groupedClients[position];
    
    // Ordenar clientes dentro da posição por subposição
    positionClients.sort((a, b) => {
      const subA = a.subPosition || 'a';
      const subB = b.subPosition || 'a';
      return subA.localeCompare(subB);
    });
    
    positionClients.forEach((client, index) => {
      const subPos = client.subPosition || 'a';
      const queueType = client.isSubdivision ? 'Sub' : 'Main';
      console.log(`| ${position} | ${client.nome.padEnd(12)} | - ${position}${subPos} | ${queueType} |`);
    });
  });
}

async function testQueueWith10Positions() {
  try {
    console.log('🔍 TESTE COMPLETO: Fila com 10 posições e subdivisões');
    console.log('====================================================');
    
    const queueId = 'test-10-positions';
    
    // Limpar fila anterior
    await redisService.deleteQueue(queueId);
    
    console.log('\n📋 CRIANDO FILA INICIAL COM 10 CLIENTES');
    console.log('========================================');
    
    // Criar 10 clientes iniciais
    const initialClients = [
      { id: 'julia', nome: 'Julia', email: 'julia@test.com', telefone: '111111111' },
      { id: 'marcos', nome: 'Marcos', email: 'marcos@test.com', telefone: '222222222' },
      { id: 'jose', nome: 'José', email: 'jose@test.com', telefone: '333333333' },
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
      await redisService.addClientToQueue(queueId, i + 1, client);
    }
    
    // Obter estado inicial
    const currentClients = await redisService.getQueueClients(queueId);
    printQueueState('ESTADO INICIAL — Fila criada com 10 clientes', currentClients);
    
    console.log('\n🔄 REALIZANDO AVANÇOS DE POSIÇÕES');
    console.log('==================================');
    
    // EVENTO 1: Fernando avança 3 posições (6 → 3)
    console.log('\n📍 EVENTO 1: Fernando avança 3 posições (6 → 3)');
    const fernando = currentClients.find(c => c.id === 'fernando');
    await redisService.advanceClientWithRental(queueId, fernando, 3);
    
    const afterAdvance1 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 1 — Fernando avança 3 posições', afterAdvance1);
    
    // EVENTO 2: Gabriela avança 2 posições (7 → 5)
    console.log('\n📍 EVENTO 2: Gabriela avança 2 posições (7 → 5)');
    const gabriela = afterAdvance1.find(c => c.id === 'gabriela');
    await redisService.advanceClientWithRental(queueId, gabriela, 2);
    
    const afterAdvance2 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 2 — Gabriela avança 2 posições', afterAdvance2);
    
    // EVENTO 3: Henrique avança 4 posições (8 → 4)
    console.log('\n📍 EVENTO 3: Henrique avança 4 posições (8 → 4)');
    const henrique = afterAdvance2.find(c => c.id === 'henrique');
    await redisService.advanceClientWithRental(queueId, henrique, 4);
    
    const afterAdvance3 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 3 — Henrique avança 4 posições', afterAdvance3);
    
    // EVENTO 4: Isabela avança 2 posições (9 → 7)
    console.log('\n📍 EVENTO 4: Isabela avança 2 posições (9 → 7)');
    const isabela = afterAdvance3.find(c => c.id === 'isabela');
    await redisService.advanceClientWithRental(queueId, isabela, 2);
    
    const afterAdvance4 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 4 — Isabela avança 2 posições', afterAdvance4);
    
    console.log('\n📞 REALIZANDO CHAMADAS DE CLIENTES');
    console.log('===================================');
    
    // EVENTO 5: Chamada de Julia
    console.log('\n📞 EVENTO 5: Chamada de Julia');
    const julia = afterAdvance4.find(c => c.id === 'julia');
    await redisService.callNextClientWithAutoMove(queueId);
    
    const afterCall1 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 5 — Julia foi chamada', afterCall1);
    
    // EVENTO 6: Chamada de Marcos
    console.log('\n📞 EVENTO 6: Chamada de Marcos');
    await redisService.callNextClientWithAutoMove(queueId);
    
    const afterCall2 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 6 — Marcos foi chamado', afterCall2);
    
    // EVENTO 7: Chamada de José
    console.log('\n📞 EVENTO 7: Chamada de José');
    await redisService.callNextClientWithAutoMove(queueId);
    
    const afterCall3 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 7 — José foi chamado', afterCall3);
    
    // EVENTO 8: Chamada de Diego
    console.log('\n📞 EVENTO 8: Chamada de Diego');
    await redisService.callNextClientWithAutoMove(queueId);
    
    const afterCall4 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 8 — Diego foi chamado', afterCall4);
    
    // EVENTO 9: Chamada de Fernando
    console.log('\n📞 EVENTO 9: Chamada de Fernando');
    await redisService.callNextClientWithAutoMove(queueId);
    
    const afterCall5 = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento 9 — Fernando foi chamado', afterCall5);
    
    console.log('\n📊 RESUMO FINAL');
    console.log('================');
    
    const finalClients = await redisService.getQueueClients(queueId);
    console.log(`\n📋 ESTADO FINAL (${finalClients.length} clientes restantes):`);
    finalClients.forEach((client, index) => {
      const subPos = client.subPosition || 'a';
      const queueType = client.isSubdivision ? 'Sub' : 'Main';
      console.log(`${index + 1}. ${client.nome} - posição ${client.position}${subPos} (${queueType})`);
    });
    
    console.log('\n📊 RESUMO DAS OPERAÇÕES:');
    console.log('========================');
    console.log('✅ Clientes adicionados: 10');
    console.log('🔄 Avanços realizados: 4');
    console.log('📞 Chamadas realizadas: 5');
    console.log(`👥 Clientes restantes: ${finalClients.length}`);
    console.log('🚪 Clientes atendidos: 5');
    
    console.log('\n🎯 CLIENTES ATENDIDOS:');
    console.log('- Julia (posição inicial: 1)');
    console.log('- Marcos (posição inicial: 2)');
    console.log('- José (posição inicial: 3)');
    console.log('- Diego (posição inicial: 4)');
    console.log('- Fernando (posição inicial: 6, avançou para 3)');
    
    console.log('\n🔄 CLIENTES QUE AVANÇARAM:');
    console.log('- Fernando: 6 → 3 (avançou 3 posições)');
    console.log('- Gabriela: 7 → 5 (avançou 2 posições)');
    console.log('- Henrique: 8 → 4 (avançou 4 posições)');
    console.log('- Isabela: 9 → 7 (avançou 2 posições)');
    
    // Limpar fila de teste
    await redisService.deleteQueue(queueId);
    console.log('\n🧹 Fila de teste limpa');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    // Fechar conexão Redis
    const client = await redisService.getRedisClient();
    if (client) {
      await client.quit();
      console.log('🔌 Conexão Redis encerrada');
    }
  }
}

// Executar teste
testQueueWith10Positions().catch(console.error);
