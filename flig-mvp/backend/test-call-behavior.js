/**
 * Teste Específico: O que acontece na fila após uma chamada
 * 
 * Este script demonstra exatamente o comportamento atual da fila
 * após uma chamada de cliente.
 */

import redisService from './services/redis.js';

// Função auxiliar para imprimir estado da fila
function printQueueState(step, description, clients) {
  console.log(`\n=== ${step} — ${description} ===`);
  
  if (!clients || clients.length === 0) {
    console.log('Fila vazia');
    return;
  }
  
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
  
  console.log('| Pos | Pessoa/Grupo | Subposição | Fila |');
  console.log('| --- | ------------ | ---------- | ---- |');
  
  sortedPositions.forEach(pos => {
    const clientsInPos = groupedClients[pos].sort((a, b) => {
      const aSub = a.subPosition || 'a';
      const bSub = b.subPosition || 'a';
      return aSub.localeCompare(bSub);
    });
    
    clientsInPos.forEach((client, index) => {
      const subPos = client.subPosition || 'a';
      const displayName = client.tipo === 'grupo' ? `Grupo ${client.nome}` : client.nome;
      const queueType = client.isSubdivision ? 'Sub' : 'Main';
      console.log(`| ${pos} | ${displayName} | - ${pos}${subPos} | ${queueType} |`);
    });
  });
}

async function testCallBehavior() {
  try {
    console.log('🔍 TESTE: O que acontece na fila após uma chamada');
    
    // Conectar ao Redis
    await redisService.connectRedis();
    
    const queueId = 'test-call-behavior';
    
    // Limpar fila anterior se existir
    await redisService.deleteQueue(queueId);
    
    // === CRIAR CENÁRIO ESPECÍFICO ===
    console.log('\n📋 Criando cenário específico...');
    
    // Adicionar clientes específicos
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
    printQueueState('Estado Inicial', 'Fila criada', clientsAfterInit);
    
    // === GUSTAVO AVANÇA (6 → 4) ===
    console.log('\n🔄 Gustavo avança 2 posições (6 → 4)');
    
    const gustavo = clientsAfterInit.find(c => c.nome === 'Gustavo');
    await redisService.advanceClientWithRental(queueId, gustavo, 2);
    
    const clientsAfterAdvance = await redisService.getQueueClients(queueId);
    printQueueState('Após Avanço', 'Gustavo avança 2 posições (6 → 4)', clientsAfterAdvance);
    
    // === CHAMADA: ANA ===
    console.log('\n📞 CHAMADA: Ana é chamada');
    console.log('🔍 O que acontece na fila após a chamada?');
    
    const nextClient = await redisService.callNextClientWithAutoMove(queueId);
    console.log(`📞 Cliente chamado: ${nextClient.nome}`);
    
    const clientsAfterCall = await redisService.getQueueClients(queueId);
    printQueueState('Após Chamada', 'Ana foi chamada - veja o que aconteceu', clientsAfterCall);
    
    // === ANÁLISE DETALHADA ===
    console.log('\n🔍 ANÁLISE DETALHADA:');
    console.log('====================');
    
    console.log('\n📊 ANTES da chamada:');
    clientsAfterAdvance.forEach(client => {
      const queueType = client.isSubdivision ? 'Subdivisão' : 'Principal';
      console.log(`- ${client.nome}: posição ${client.position}${client.subPosition} (${queueType})`);
    });
    
    console.log('\n📊 DEPOIS da chamada:');
    clientsAfterCall.forEach(client => {
      const queueType = client.isSubdivision ? 'Subdivisão' : 'Principal';
      console.log(`- ${client.nome}: posição ${client.position}${client.subPosition} (${queueType})`);
    });
    
    console.log('\n🎯 O QUE DEVERIA ACONTECER (segundo sua simulação):');
    console.log('- Bruno: 2a → 1a');
    console.log('- Carla: 3a → 2a');
    console.log('- Grupo Silva: 4a → 3a');
    console.log('- Gustavo: 4b → 4a (promovido para posição principal)');
    
    console.log('\n❌ O QUE REALMENTE ACONTECEU:');
    const gustavoAfter = clientsAfterCall.find(c => c.nome === 'Gustavo');
    if (gustavoAfter) {
      console.log(`- Gustavo: ${gustavoAfter.position}${gustavoAfter.subPosition} (${gustavoAfter.isSubdivision ? 'Subdivisão' : 'Principal'})`);
      console.log('❌ PROBLEMA: Gustavo não foi promovido para posição principal!');
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
  testCallBehavior()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default testCallBehavior;
