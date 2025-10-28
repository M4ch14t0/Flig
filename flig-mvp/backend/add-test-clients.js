#!/usr/bin/env node

/**
 * Adicionar clientes de teste na fila
 */

import axios from 'axios';

const API_BASE_URL = 'https://flig-production.up.railway.app';

async function addTestClients() {
  try {
    console.log('🚀 Adicionando clientes de teste na fila...\n');

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

    // 3. Adicionar clientes de teste
    const testClients = [
      { nome: 'João Silva', email: 'joao@teste.com', telefone: '11999999999' },
      { nome: 'Maria Santos', email: 'maria@teste.com', telefone: '11888888888' },
      { nome: 'Pedro Costa', email: 'pedro@teste.com', telefone: '11777777777' },
      { nome: 'Ana Oliveira', email: 'ana@teste.com', telefone: '11666666666' },
      { nome: 'Carlos Lima', email: 'carlos@teste.com', telefone: '11555555555' }
    ];

    console.log('3️⃣ Adicionando clientes de teste...');
    
    for (let i = 0; i < testClients.length; i++) {
      const client = testClients[i];
      console.log(`   Adicionando ${client.nome}...`);
      
      try {
        const addResponse = await axios.post(`${API_BASE_URL}/api/queues/${queue.id}/join`, {
          nome: client.nome,
          email: client.email,
          telefone: client.telefone
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (addResponse.data.success) {
          console.log(`   ✅ ${client.nome} adicionado com sucesso`);
        } else {
          console.log(`   ❌ Erro ao adicionar ${client.nome}: ${addResponse.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro ao adicionar ${client.nome}: ${error.response?.data?.message || error.message}`);
      }
      
      // Pequeno delay entre adições
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n4️⃣ Verificando clientes na fila...');
    const clientsResponse = await axios.get(`${API_BASE_URL}/api/queues/${queue.id}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (clientsResponse.data.success) {
      const clients = clientsResponse.data.data;
      console.log(`✅ ${clients.length} clientes na fila:`);
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.nome} - Posição ${client.position}`);
      });
    }

    console.log('\n🎉 Clientes de teste adicionados com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Executar
addTestClients();
