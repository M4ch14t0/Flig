#!/usr/bin/env node

/**
 * Debug detalhado do avanço
 */

import axios from 'axios';

const API_BASE_URL = 'https://flig-production.up.railway.app';

async function debugAdvanceDetailed() {
  try {
    console.log('🔍 Debug detalhado do avanço...\n');

    // 1. Login como usuário
    console.log('1️⃣ Fazendo login como usuário...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login/user`, {
      email_usuario: 'testando@email.com',
      senha_usuario: 'Abcd1234'
    });

    if (!loginResponse.data.success) {
      throw new Error('Falha no login: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Listar filas ativas do usuário
    console.log('2️⃣ Listando filas ativas do usuário...');
    const queuesResponse = await axios.get(`${API_BASE_URL}/api/users/active-queues`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!queuesResponse.data.success || !queuesResponse.data.data.length) {
      throw new Error('Nenhuma fila ativa encontrada');
    }

    const userQueue = queuesResponse.data.data[0];
    console.log(`✅ Fila ativa: ${userQueue.fila_nome}`);
    console.log(`   Posição atual: ${userQueue.posicao_atual}`);
    console.log(`   Queue ID: ${userQueue.queue_id}\n`);

    // 3. Listar clientes da fila para encontrar o cliente correto
    console.log('3️⃣ Listando clientes da fila...');
    const clientsResponse = await axios.get(`${API_BASE_URL}/api/queues/${userQueue.queue_id}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (clientsResponse.data.success) {
      const clients = clientsResponse.data.data.clients;
      const currentUser = clients.find(client => client.nome === 'Teste');
      
      if (currentUser) {
        console.log(`✅ Cliente encontrado: ${currentUser.nome}`);
        console.log(`   ID: ${currentUser.id}`);
        console.log(`   Posição atual: ${currentUser.position}`);
        console.log(`   Email: ${currentUser.email || 'N/A'}`);
        
        // 4. Testar avanço com o ID correto do cliente
        console.log('\n4️⃣ Testando avanço com ID correto...');
        const advanceResponse = await axios.post(`${API_BASE_URL}/api/queues/${userQueue.queue_id}/advance`, {
          clientId: currentUser.id, // Usar o ID correto do cliente na fila
          positions: 1
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (advanceResponse.data.success) {
          const result = advanceResponse.data.data;
          console.log('✅ Avanço realizado com sucesso!');
          console.log(`   Posição anterior: ${result.oldPosition}`);
          console.log(`   Nova posição: ${result.newPosition}`);
          console.log(`   Posições avançadas: ${result.positionsAdvanced}`);
          console.log(`   Tempo estimado: ${result.estimatedTime}min`);
          console.log(`   Valor: R$ ${result.amount} (não processado)`);
          console.log(`   Avanço direto: ${result.directAdvance}`);
        } else {
          console.log('❌ Erro no avanço:', advanceResponse.data.message);
        }
      } else {
        console.log('❌ Cliente "Teste" não encontrado na fila');
      }
    } else {
      console.log('❌ Erro ao listar clientes:', clientsResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Executar
debugAdvanceDetailed();
