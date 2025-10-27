/**
 * Script de Teste para Lógica de Fila com Duas Filas Separadas
 * 
 * Este script testa a nova arquitetura de duas filas:
 * - Fila Principal: Gerencia posições principais (1, 2, 3, 4, etc.)
 * - Fila de Subdivisões: Gerencia subposições (a, b, c, etc.) com IDs condizentes
 * 
 * Simula exatamente o cenário fornecido pelo usuário:
 * 1. Estado inicial com 10 pessoas
 * 2. Gustavo avança 2 posições (6 → 4)
 * 3. Chamada: Ana
 * 4. Chamada: Bruno
 * 5. Helena avança 3 posições (7 → 4)
 * 6. Chamada do Grupo Silva (mesa para 4)
 * 
 * @version 3.0.0
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
  
  console.log('| Pos | Pessoa/Grupo | Subposição |');
  console.log('| --- | ------------ | ---------- |');
  
  sortedPositions.forEach(pos => {
    const clientsInPos = groupedClients[pos].sort((a, b) => {
      const aSub = a.subPosition || 'a';
      const bSub = b.subPosition || 'a';
      return aSub.localeCompare(bSub);
    });
    
    clientsInPos.forEach((client, index) => {
      const subPos = client.subPosition || 'a';
      const displayName = client.tipo === 'grupo' ? `Grupo ${client.nome}` : client.nome;
      console.log(`| ${pos} | ${displayName} | - ${pos}${subPos} |`);
    });
  });
}

// Função para verificar se o estado atual corresponde ao esperado
function verifyState(expectedState, actualClients, stepName) {
  console.log(`\n🔍 Verificando ${stepName}...`);
  
  // Agrupar clientes atuais por posição
  const actualGrouped = {};
  actualClients.forEach(client => {
    const pos = client.position;
    if (!actualGrouped[pos]) {
      actualGrouped[pos] = [];
    }
    actualGrouped[pos].push(client);
  });
  
  let allCorrect = true;
  
  // Verificar cada posição esperada
  Object.keys(expectedState).forEach(pos => {
    const expectedClients = expectedState[pos];
    const actualClientsInPos = actualGrouped[pos] || [];
    
    if (expectedClients.length !== actualClientsInPos.length) {
      console.log(`❌ Posição ${pos}: esperado ${expectedClients.length} clientes, encontrado ${actualClientsInPos.length}`);
      allCorrect = false;
    } else {
      // Verificar se os nomes correspondem
      const expectedNames = expectedClients.map(c => c.nome).sort();
      const actualNames = actualClientsInPos.map(c => c.nome).sort();
      
      if (JSON.stringify(expectedNames) !== JSON.stringify(actualNames)) {
        console.log(`❌ Posição ${pos}: nomes não correspondem`);
        console.log(`   Esperado: ${expectedNames.join(', ')}`);
        console.log(`   Encontrado: ${actualNames.join(', ')}`);
        allCorrect = false;
      } else {
        console.log(`✅ Posição ${pos}: ${expectedClients.length} clientes corretos`);
      }
    }
  });
  
  return allCorrect;
}

async function testDualQueueLogic() {
  try {
    console.log('🚀 Iniciando teste da lógica de fila com duas filas separadas');
    
    // Conectar ao Redis
    await redisService.connectRedis();
    
    const queueId = 'test-queue-dual-architecture';
    
    // Limpar fila anterior se existir
    await redisService.deleteQueue(queueId);
    
    // === ESTADO INICIAL ===
    console.log('\n📋 Criando estado inicial...');
    
    const initialClients = [
      { id: 'ana', nome: 'Ana', email: 'ana@test.com', telefone: '111111111' },
      { id: 'bruno', nome: 'Bruno', email: 'bruno@test.com', telefone: '222222222' },
      { id: 'carla', nome: 'Carla', email: 'carla@test.com', telefone: '333333333' },
      { id: 'grupo-silva', nome: 'Silva', email: 'silva@test.com', telefone: '444444444', tipo: 'grupo', isGroupLeader: true, groupSize: 4 },
      { id: 'eduardo', nome: 'Eduardo', email: 'eduardo@test.com', telefone: '555555555' },
      { id: 'gustavo', nome: 'Gustavo', email: 'gustavo@test.com', telefone: '666666666' },
      { id: 'diego', nome: 'Diego', email: 'diego@test.com', telefone: '777777777' },
      { id: 'fernanda', nome: 'Fernanda', email: 'fernanda@test.com', telefone: '888888888' },
      { id: 'helena', nome: 'Helena', email: 'helena@test.com', telefone: '999999999' },
      { id: 'igor', nome: 'Igor', email: 'igor@test.com', telefone: '000000000' }
    ];
    
    // Adicionar clientes à fila
    for (let i = 0; i < initialClients.length; i++) {
      const client = initialClients[i];
      await redisService.addClientToQueue(queueId, i + 1, client, 'a');
    }
    
    const clientsAfterInit = await redisService.getQueueClients(queueId);
    printQueueState('Estado Inicial', 'Fila criada', clientsAfterInit);
    
    // Estado esperado inicial
    const expectedInitial = {
      '1': [{ nome: 'Ana' }],
      '2': [{ nome: 'Bruno' }],
      '3': [{ nome: 'Carla' }],
      '4': [{ nome: 'Silva' }],
      '5': [{ nome: 'Eduardo' }],
      '6': [{ nome: 'Gustavo' }],
      '7': [{ nome: 'Diego' }],
      '8': [{ nome: 'Fernanda' }],
      '9': [{ nome: 'Helena' }],
      '10': [{ nome: 'Igor' }]
    };
    
    const initialCorrect = verifyState(expectedInitial, clientsAfterInit, 'Estado Inicial');
    
    // === PASSO 1 — Gustavo avança 2 posições (6 → 4) ===
    console.log('\n🔄 Passo 1 — Gustavo avança 2 posições (6 → 4)');
    
    const gustavo = clientsAfterInit.find(c => c.nome === 'Gustavo');
    await redisService.advanceClientWithRental(queueId, gustavo, 2);
    
    const clientsAfterStep1 = await redisService.getQueueClients(queueId);
    printQueueState('Passo 1', 'Gustavo avança 2 posições (6 → 4)', clientsAfterStep1);
    
    // Estado esperado após passo 1
    const expectedStep1 = {
      '1': [{ nome: 'Ana' }],
      '2': [{ nome: 'Bruno' }],
      '3': [{ nome: 'Carla' }],
      '4': [{ nome: 'Silva' }, { nome: 'Gustavo' }],
      '5': [{ nome: 'Eduardo' }],
      '6': [{ nome: 'Diego' }],
      '7': [{ nome: 'Fernanda' }],
      '8': [{ nome: 'Helena' }],
      '9': [{ nome: 'Igor' }]
    };
    
    const step1Correct = verifyState(expectedStep1, clientsAfterStep1, 'Passo 1');
    
    // === PASSO 2 — Chamada: Ana ===
    console.log('\n📞 Passo 2 — Chamada: Ana');
    
    await redisService.callNextClientWithAutoMove(queueId);
    
    const clientsAfterStep2 = await redisService.getQueueClients(queueId);
    printQueueState('Passo 2', 'Chamada: Ana', clientsAfterStep2);
    
    // Estado esperado após passo 2
    const expectedStep2 = {
      '1': [{ nome: 'Bruno' }],
      '2': [{ nome: 'Carla' }],
      '3': [{ nome: 'Silva' }],
      '4': [{ nome: 'Gustavo' }],
      '5': [{ nome: 'Eduardo' }],
      '6': [{ nome: 'Diego' }],
      '7': [{ nome: 'Fernanda' }],
      '8': [{ nome: 'Helena' }],
      '9': [{ nome: 'Igor' }]
    };
    
    const step2Correct = verifyState(expectedStep2, clientsAfterStep2, 'Passo 2');
    
    // === PASSO 3 — Chamada: Bruno ===
    console.log('\n📞 Passo 3 — Chamada: Bruno');
    
    await redisService.callNextClientWithAutoMove(queueId);
    
    const clientsAfterStep3 = await redisService.getQueueClients(queueId);
    printQueueState('Passo 3', 'Chamada: Bruno', clientsAfterStep3);
    
    // Estado esperado após passo 3
    const expectedStep3 = {
      '1': [{ nome: 'Carla' }],
      '2': [{ nome: 'Silva' }],
      '3': [{ nome: 'Gustavo' }],
      '4': [{ nome: 'Eduardo' }],
      '5': [{ nome: 'Diego' }],
      '6': [{ nome: 'Fernanda' }],
      '7': [{ nome: 'Helena' }],
      '8': [{ nome: 'Igor' }]
    };
    
    const step3Correct = verifyState(expectedStep3, clientsAfterStep3, 'Passo 3');
    
    // === PASSO 4 — Helena avança 3 posições (7 → 4) ===
    console.log('\n🔄 Passo 4 — Helena avança 3 posições (7 → 4)');
    
    const helena = clientsAfterStep3.find(c => c.nome === 'Helena');
    await redisService.advanceClientWithRental(queueId, helena, 3);
    
    const clientsAfterStep4 = await redisService.getQueueClients(queueId);
    printQueueState('Passo 4', 'Helena avança 3 posições (7 → 4)', clientsAfterStep4);
    
    // Estado esperado após passo 4
    const expectedStep4 = {
      '1': [{ nome: 'Carla' }],
      '2': [{ nome: 'Silva' }],
      '3': [{ nome: 'Gustavo' }],
      '4': [{ nome: 'Eduardo' }, { nome: 'Helena' }],
      '5': [{ nome: 'Diego' }],
      '6': [{ nome: 'Fernanda' }],
      '7': [{ nome: 'Igor' }]
    };
    
    const step4Correct = verifyState(expectedStep4, clientsAfterStep4, 'Passo 4');
    
    // === PASSO 5 — Chamada do Grupo Silva (mesa para 4) ===
    console.log('\n📞 Passo 5 — Chamada do Grupo Silva (mesa para 4)');
    
    await redisService.callNextClientWithAutoMove(queueId);
    
    const clientsAfterStep5 = await redisService.getQueueClients(queueId);
    printQueueState('Passo 5', 'Chamada do Grupo Silva (mesa para 4)', clientsAfterStep5);
    
    // Estado esperado após passo 5
    const expectedStep5 = {
      '1': [{ nome: 'Gustavo' }],
      '2': [{ nome: 'Eduardo' }],
      '3': [{ nome: 'Helena' }],
      '4': [{ nome: 'Diego' }],
      '5': [{ nome: 'Fernanda' }],
      '6': [{ nome: 'Igor' }]
    };
    
    const step5Correct = verifyState(expectedStep5, clientsAfterStep5, 'Passo 5');
    
    // === RESULTADO FINAL ===
    console.log('\n🎯 RESULTADO FINAL:');
    console.log('==================');
    
    const allStepsCorrect = initialCorrect && step1Correct && step2Correct && step3Correct && step4Correct && step5Correct;
    
    if (allStepsCorrect) {
      console.log('✅ SUCESSO! Todos os passos estão corretos!');
      console.log('✅ A lógica de fila com duas filas separadas está funcionando perfeitamente!');
    } else {
      console.log('❌ FALHA! Alguns passos não estão corretos.');
      console.log('❌ A lógica de fila precisa ser ajustada.');
    }
    
    console.log('\n📊 Resumo dos testes:');
    console.log(`Estado Inicial: ${initialCorrect ? '✅' : '❌'}`);
    console.log(`Passo 1 (Gustavo avança): ${step1Correct ? '✅' : '❌'}`);
    console.log(`Passo 2 (Chamada Ana): ${step2Correct ? '✅' : '❌'}`);
    console.log(`Passo 3 (Chamada Bruno): ${step3Correct ? '✅' : '❌'}`);
    console.log(`Passo 4 (Helena avança): ${step4Correct ? '✅' : '❌'}`);
    console.log(`Passo 5 (Chamada Grupo Silva): ${step5Correct ? '✅' : '❌'}`);
    
    // Limpar fila de teste
    await redisService.deleteQueue(queueId);
    console.log('\n🧹 Fila de teste limpa');
    
    return allStepsCorrect;
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Desconectar do Redis
    await redisService.disconnectRedis();
  }
}

// Executar teste se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testDualQueueLogic()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default testDualQueueLogic;
