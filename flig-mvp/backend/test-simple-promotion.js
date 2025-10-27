/**
 * TESTE SIMPLES: Verificar se a função applyAutoMove está funcionando
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

async function testSimplePromotion() {
  try {
    console.log('🔍 TESTE SIMPLES: Verificar se a função applyAutoMove está funcionando');
    console.log('====================================================================');
    
    // Conectar ao Redis
    await redisService.connectRedis();
    
    const queueId = 'test-simple-promotion';
    
    // Limpar fila anterior se existir
    await redisService.deleteQueue(queueId);
    
    // === CRIAR CENÁRIO SIMPLES ===
    console.log('\n📋 Criando cenário simples...');
    
    // Adicionar clientes diretamente às filas
    const client = await redisService.getRedisClient();
    const mainQueueKey = redisService.getMainQueueKey(queueId);
    const subQueueKey = redisService.getSubdivisionQueueKey(queueId);
    
    // Adicionar Bruno na posição 1 (principal)
    await client.zAdd(mainQueueKey, {
      score: 1,
      value: JSON.stringify({
        id: 'bruno',
        nome: 'Bruno',
        email: 'bruno@test.com',
        telefone: '222222222',
        position: 1,
        subPosition: 'a',
        subdivisionId: '1-a',
        isSubdivision: false
      })
    });
    
    // Adicionar Carla na posição 2 (principal)
    await client.zAdd(mainQueueKey, {
      score: 2,
      value: JSON.stringify({
        id: 'carla',
        nome: 'Carla',
        email: 'carla@test.com',
        telefone: '333333333',
        position: 2,
        subPosition: 'a',
        subdivisionId: '2-a',
        isSubdivision: false
      })
    });
    
    // Adicionar Gustavo na posição 3 (subdivisão órfã - sem principal)
    await client.zAdd(subQueueKey, {
      score: 3,
      value: JSON.stringify({
        id: 'gustavo',
        nome: 'Gustavo',
        email: 'gustavo@test.com',
        telefone: '666666666',
        position: 3,
        subPosition: 'b',
        subdivisionId: '3-b',
        isSubdivision: true
      })
    });
    
    const clientsAfterInit = await redisService.getQueueClients(queueId);
    printDetailedState('Estado Inicial', 'Fila criada com Gustavo órfão', clientsAfterInit);
    
    // === APLICAR MOVIMENTO AUTOMÁTICO ===
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
  testSimplePromotion()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default testSimplePromotion;
