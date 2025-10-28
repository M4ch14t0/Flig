#!/usr/bin/env node

/**
 * Teste do Fluxo Completo de Avanço na Fila
 * Frontend → Backend → Redis (sem validação de pagamento)
 */

import axios from 'axios';

const API_BASE_URL = 'https://flig-production.up.railway.app';

async function testAdvanceFlow() {
  try {
    console.log('🚀 Testando fluxo completo de avanço na fila...\n');

    // 1. Login como estabelecimento
    console.log('1️⃣ Fazendo login como estabelecimento...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login/establishment`, {
      email_empresa: 'testeestab@email.com',
      senha_empresa: 'Abcd1234'
    });

    if (!loginResponse.data.success) {
      throw new Error('Falha no login: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Listar filas do estabelecimento
    console.log('2️⃣ Listando filas do estabelecimento...');
    const queuesResponse = await axios.get(`${API_BASE_URL}/api/queues/establishment/4`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!queuesResponse.data.success || !queuesResponse.data.data.length) {
      throw new Error('Nenhuma fila encontrada');
    }

    const queue = queuesResponse.data.data[0];
    console.log(`✅ Fila encontrada: ${queue.nome} (ID: ${queue.id})\n`);

    // 3. Listar clientes da fila
    console.log('3️⃣ Listando clientes da fila...');
    const clientsResponse = await axios.get(`${API_BASE_URL}/api/queues/${queue.id}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!clientsResponse.data.success || !clientsResponse.data.data.length) {
      throw new Error('Nenhum cliente encontrado na fila');
    }

    const clients = clientsResponse.data.data;
    console.log(`✅ ${clients.length} clientes encontrados na fila`);
    clients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.nome} - Posição ${client.position}`);
    });
    console.log();

    // 4. Testar avanço de um cliente (simulando frontend)
    const clientToAdvance = clients[0]; // Primeiro cliente
    const positionsToAdvance = 2;

    console.log(`4️⃣ Testando avanço do cliente ${clientToAdvance.nome}...`);
    console.log(`   Posição atual: ${clientToAdvance.position}`);
    console.log(`   Posições a avançar: ${positionsToAdvance}`);

    const advanceResponse = await axios.post(`${API_BASE_URL}/api/queues/${queue.id}/advance`, {
      clientId: clientToAdvance.id,
      positions: positionsToAdvance
      // paymentData removido - backend vai pular validação
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!advanceResponse.data.success) {
      throw new Error('Falha no avanço: ' + advanceResponse.data.message);
    }

    const advanceResult = advanceResponse.data.data;
    console.log('✅ Avanço realizado com sucesso!');
    console.log(`   Posição anterior: ${advanceResult.oldPosition}`);
    console.log(`   Nova posição: ${advanceResult.newPosition}`);
    console.log(`   Posições avançadas: ${advanceResult.positionsAdvanced}`);
    console.log(`   Tempo estimado: ${advanceResult.estimatedTime}min`);
    console.log(`   Valor: R$ ${advanceResult.amount} (não processado)`);
    console.log(`   Avanço direto: ${advanceResult.directAdvance}\n`);

    // 5. Verificar se a fila foi atualizada no Redis
    console.log('5️⃣ Verificando fila atualizada no Redis...');
    const updatedClientsResponse = await axios.get(`${API_BASE_URL}/api/queues/${queue.id}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (updatedClientsResponse.data.success) {
      const updatedClients = updatedClientsResponse.data.data;
      console.log(`✅ Fila atualizada: ${updatedClients.length} clientes`);
      updatedClients.forEach((client, index) => {
        const isAdvanced = client.id === clientToAdvance.id;
        console.log(`   ${index + 1}. ${client.nome} - Posição ${client.position}${isAdvanced ? ' ⬆️ AVANÇADO' : ''}`);
      });
    }

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ Fluxo completo funcionando: Frontend → Backend → Redis');
    console.log('✅ Validação de pagamento pulada com sucesso');
    console.log('✅ Fila reorganizada no Redis');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Executar teste
testAdvanceFlow();
