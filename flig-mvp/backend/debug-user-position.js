#!/usr/bin/env node

/**
 * Debug da posição do usuário na fila
 */

import axios from 'axios';

const API_BASE_URL = 'https://flig-production.up.railway.app';

async function debugUserPosition() {
  try {
    console.log('🔍 Debugando posição do usuário na fila...\n');

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

    // 3. Listar todos os clientes da fila
    console.log('3️⃣ Listando todos os clientes da fila...');
    const clientsResponse = await axios.get(`${API_BASE_URL}/api/queues/${userQueue.queue_id}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('🔍 Resposta da API de clientes:', JSON.stringify(clientsResponse.data, null, 2));

    if (clientsResponse.data.success) {
      const clients = clientsResponse.data.data.clients;
      console.log(`✅ ${clients.length} clientes na fila:`);
      clients.forEach((client, index) => {
        const isCurrentUser = client.nome === 'Teste';
        console.log(`   ${index + 1}. ${client.nome} - Posição ${client.position}${isCurrentUser ? ' 👤 (VOCÊ)' : ''}`);
      });
    } else {
      console.log('❌ Erro ao listar clientes:', clientsResponse.data.message);
    }

    // 4. Testar cálculo de avanço
    console.log('\n4️⃣ Testando cálculo de avanço...');
    const currentPosition = userQueue.posicao_atual;
    const positionsToAdvance = 1;
    const desiredPosition = Math.max(4, currentPosition - positionsToAdvance);
    
    console.log(`   Posição atual: ${currentPosition}`);
    console.log(`   Posições a avançar: ${positionsToAdvance}`);
    console.log(`   Posição desejada: ${desiredPosition}`);
    console.log(`   Posição mínima permitida: 4`);
    
    if (desiredPosition >= currentPosition) {
      console.log('   ❌ ERRO: Não é possível avançar - posição mínima é 4');
    } else {
      console.log('   ✅ OK: Avanço seria possível');
    }

    // 5. Verificar se posição atual está nas posições bloqueadas
    if (currentPosition <= 3) {
      console.log('   ❌ ERRO: Usuário está nas posições bloqueadas (1, 2, 3)');
    } else {
      console.log('   ✅ OK: Usuário não está nas posições bloqueadas');
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Executar
debugUserPosition();
