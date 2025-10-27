/**
 * TESTE: Correção da lacuna após avanço
 * 
 * Este teste demonstra que após um avanço, a lacuna deixada na posição original
 * é preenchida automaticamente pelos clientes abaixo.
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

async function testGapFilling() {
  try {
    console.log('🔍 TESTE: Correção da lacuna após avanço');
    console.log('==========================================');
    
    const queueId = 'test-gap-filling';
    
    // Limpar fila anterior
    await redisService.deleteQueue(queueId);
    
    console.log('\n📋 CRIANDO FILA INICIAL');
    console.log('========================');
    
    // Criar fila inicial conforme exemplo do usuário
    const initialClients = [
      { id: 'julia', nome: 'Julia', email: 'julia@test.com', telefone: '111111111' },
      { id: 'jose', nome: 'José', email: 'jose@test.com', telefone: '222222222' },
      { id: 'afonso', nome: 'Afonso', email: 'afonso@test.com', telefone: '333333333' },
      { id: 'lucas', nome: 'Lucas', email: 'lucas@test.com', telefone: '444444444' },
      { id: 'daniel', nome: 'Daniel', email: 'daniel@test.com', telefone: '555555555' },
      { id: 'gabriel', nome: 'Gabriel', email: 'gabriel@test.com', telefone: '666666666' }
    ];
    
    // Adicionar clientes à fila
    for (let i = 0; i < initialClients.length; i++) {
      const client = initialClients[i];
      await redisService.addClientToQueue(queueId, i + 1, client);
    }
    
    // Obter estado inicial
    const currentClients = await redisService.getQueueClients(queueId);
    printQueueState('ESTADO INICIAL — Fila criada com 6 clientes', currentClients);
    
    console.log('\n🔄 REALIZANDO AVANÇO DE POSIÇÃO');
    console.log('=================================');
    
    // EVENTO: Daniel avança 1 posição (5 → 4)
    console.log('\n📍 EVENTO: Daniel avança 1 posição (5 → 4)');
    const daniel = currentClients.find(c => c.id === 'daniel');
    await redisService.advanceClientWithRental(queueId, daniel, 1);
    
    const afterAdvance = await redisService.getQueueClients(queueId);
    printQueueState('Após Evento — Daniel avança 1 posição', afterAdvance);
    
    console.log('\n📊 ANÁLISE DO RESULTADO');
    console.log('========================');
    
    // Verificar se Gabriel subiu para posição 5 (preencheu a lacuna)
    const gabriel = afterAdvance.find(c => c.id === 'gabriel');
    if (gabriel && gabriel.position === 5) {
      console.log('✅ SUCESSO: Gabriel subiu para posição 5 (lacuna preenchida)');
    } else {
      console.log('❌ ERRO: Gabriel não subiu para posição 5');
      console.log(`   Gabriel está na posição: ${gabriel ? gabriel.position : 'não encontrado'}`);
    }
    
    // Verificar se Daniel está na posição 4 como subdivisão
    const danielAfter = afterAdvance.find(c => c.id === 'daniel');
    if (danielAfter && danielAfter.position === 4 && danielAfter.subPosition === 'b') {
      console.log('✅ SUCESSO: Daniel está na posição 4b (subdivisão)');
    } else {
      console.log('❌ ERRO: Daniel não está na posição 4b');
      console.log(`   Daniel está na posição: ${danielAfter ? `${danielAfter.position}${danielAfter.subPosition || 'a'}` : 'não encontrado'}`);
    }
    
    // Verificar se Lucas está na posição 4 como principal
    const lucas = afterAdvance.find(c => c.id === 'lucas');
    if (lucas && lucas.position === 4 && lucas.subPosition === 'a' && !lucas.isSubdivision) {
      console.log('✅ SUCESSO: Lucas está na posição 4a (principal)');
    } else {
      console.log('❌ ERRO: Lucas não está na posição 4a como principal');
      console.log(`   Lucas está na posição: ${lucas ? `${lucas.position}${lucas.subPosition || 'a'}` : 'não encontrado'}`);
    }
    
    console.log('\n📋 ESTADO FINAL ESPERADO:');
    console.log('| 1 | Julia   | 1a | Main |');
    console.log('| 2 | José    | 2a | Main |');
    console.log('| 3 | Afonso  | 3a | Main |');
    console.log('| 4 | Lucas   | 4a | Main |');
    console.log('| 4 | Daniel  | 4b | Sub  |');
    console.log('| 5 | Gabriel | 5a | Main | ← Gabriel subiu para 5 (lacuna preenchida)');
    
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
testGapFilling().catch(console.error);
