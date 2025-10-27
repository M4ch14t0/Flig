/**
 * EXPLICAÇÃO SIMPLES: O que são "Subdivisões Órfãs sem Cliente Principal Correspondente"
 * 
 * Este script demonstra exatamente o que significa esse conceito
 * com exemplos práticos e visuais.
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

async function explainOrphanSubdivisions() {
  try {
    console.log('🔍 EXPLICAÇÃO: Subdivisões Órfãs sem Cliente Principal Correspondente');
    console.log('==================================================================');
    
    // Conectar ao Redis
    await redisService.connectRedis();
    
    const queueId = 'test-orphan-explanation';
    
    // Limpar fila anterior se existir
    await redisService.deleteQueue(queueId);
    
    // === CENÁRIO: SITUAÇÃO ÓRFÃ (SEM CLIENTE PRINCIPAL) ===
    console.log('\n📋 CENÁRIO: SITUAÇÃO ÓRFÃ (SEM CLIENTE PRINCIPAL)');
    console.log('==================================================');
    
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
    
    console.log('\n✅ SITUAÇÃO NORMAL:');
    console.log('- Posição 3 tem Carla (Principal) + Gustavo (Subdivisão)');
    console.log('- Carla é o "cliente principal correspondente" de Gustavo');
    console.log('- Gustavo NÃO é órfão porque tem Carla na mesma posição');
    
    // === CENÁRIO: O QUE ACONTECE APÓS CHAMADA ===
    console.log('\n📋 CENÁRIO: O QUE ACONTECE APÓS CHAMADA');
    console.log('========================================');
    
    console.log('\n🔍 ANTES da chamada:');
    clientsAfterAdvance.forEach(client => {
      const queueType = client.isSubdivision ? 'Subdivisão' : 'Principal';
      console.log(`- ${client.nome}: posição ${client.position}${client.subPosition} (${queueType})`);
    });
    
    // Chamar Ana
    console.log('\n📞 Chamando Ana...');
    await redisService.removeClientFromQueue(queueId, clientsAfterAdvance.find(c => c.nome === 'Ana'));
    
    const clientsAfterRemoval = await redisService.getQueueClients(queueId);
    printDetailedState('Após Remoção', 'Ana removida', clientsAfterRemoval);
    
    console.log('\n🔍 APÓS remover Ana:');
    clientsAfterRemoval.forEach(client => {
      const queueType = client.isSubdivision ? 'Subdivisão' : 'Principal';
      console.log(`- ${client.nome}: posição ${client.position}${client.subPosition} (${queueType})`);
    });
    
    // Aplicar movimento automático
    console.log('\n🔄 Aplicando movimento automático...');
    await redisService.applyAutoMove(queueId);
    
    const clientsAfterAutoMove = await redisService.getQueueClients(queueId);
    printDetailedState('Após AutoMove', 'Movimento automático aplicado', clientsAfterAutoMove);
    
    console.log('\n🔍 APÓS movimento automático:');
    clientsAfterAutoMove.forEach(client => {
      const queueType = client.isSubdivision ? 'Subdivisão' : 'Principal';
      console.log(`- ${client.nome}: posição ${client.position}${client.subPosition} (${queueType})`);
    });
    
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
    }
    
    console.log('\n🔍 EXPLICAÇÃO DO CONCEITO "ÓRFÃO":');
    console.log('==================================');
    console.log('Uma subdivisão é "ÓRFÃ" quando:');
    console.log('1. Ela está em uma posição onde NÃO há cliente principal');
    console.log('2. Ela deveria ser promovida para posição principal');
    console.log('3. Mas a função applyAutoMove não está fazendo isso');
    
    console.log('\n📊 RESUMO:');
    console.log('==========');
    console.log('✅ SITUAÇÃO NORMAL: Posição tem cliente principal + subdivisões');
    console.log('❌ SITUAÇÃO ÓRFÃ: Posição tem APENAS subdivisões (sem principal)');
    console.log('🔧 SOLUÇÃO: Promover subdivisões órfãs para posição principal');
    
    // Limpar fila de teste
    await redisService.deleteQueue(queueId);
    console.log('\n🧹 Fila de teste limpa');
    
  } catch (error) {
    console.error('❌ Erro durante a explicação:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Desconectar do Redis
    await redisService.disconnectRedis();
  }
}

// Executar explicação se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  explainOrphanSubdivisions()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default explainOrphanSubdivisions;