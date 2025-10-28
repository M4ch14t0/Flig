#!/usr/bin/env node

/**
 * Adicionar clientes de teste simulando login como usuário
 */

import axios from 'axios';

const API_BASE_URL = 'https://flig-production.up.railway.app';

async function addClientsAsUser() {
  try {
    console.log('🚀 Adicionando clientes de teste como usuário...\n');

    // 1. Login como usuário cliente
    console.log('1️⃣ Fazendo login como usuário cliente...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login/user`, {
      email: 'testeuser@email.com',
      senha: 'Abcd1234'
    });

    if (!loginResponse.data.success) {
      throw new Error('Falha no login: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login como usuário realizado com sucesso\n');

    // 2. Listar filas disponíveis
    console.log('2️⃣ Listando filas disponíveis...');
    const queuesResponse = await axios.get(`${API_BASE_URL}/api/queues`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!queuesResponse.data.success || !queuesResponse.data.data.length) {
      throw new Error('Nenhuma fila encontrada');
    }

    const queue = queuesResponse.data.data[0];
    console.log(`✅ Fila encontrada: ${queue.nome} (ID: ${queue.id})\n`);

    // 3. Adicionar cliente na fila
    console.log('3️⃣ Adicionando cliente na fila...');
    const joinResponse = await axios.post(`${API_BASE_URL}/api/queues/${queue.id}/join`, {
      nome: 'Teste Usuário',
      email: 'testeuser@email.com',
      telefone: '11999999999'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (joinResponse.data.success) {
      console.log('✅ Cliente adicionado com sucesso');
      console.log(`   Posição: ${joinResponse.data.data.position}`);
      console.log(`   Tempo estimado: ${joinResponse.data.data.estimatedTime}min`);
    } else {
      console.log('❌ Erro ao adicionar cliente:', joinResponse.data.message);
    }

    // 4. Adicionar mais alguns clientes com emails diferentes
    const additionalClients = [
      { nome: 'João Silva', email: 'joao@teste.com', telefone: '11888888888' },
      { nome: 'Maria Santos', email: 'maria@teste.com', telefone: '11777777777' },
      { nome: 'Pedro Costa', email: 'pedro@teste.com', telefone: '11666666666' }
    ];

    console.log('\n4️⃣ Adicionando clientes adicionais...');
    
    for (const client of additionalClients) {
      console.log(`   Adicionando ${client.nome}...`);
      
      try {
        // Fazer login com email único para cada cliente
        const clientLoginResponse = await axios.post(`${API_BASE_URL}/api/auth/register/user`, {
          nome: client.nome,
          email: client.email,
          senha: 'Abcd1234',
          telefone: client.telefone
        });

        if (clientLoginResponse.data.success) {
          const clientToken = clientLoginResponse.data.data.token;
          
          const addResponse = await axios.post(`${API_BASE_URL}/api/queues/${queue.id}/join`, {
            nome: client.nome,
            email: client.email,
            telefone: client.telefone
          }, {
            headers: { Authorization: `Bearer ${clientToken}` }
          });

          if (addResponse.data.success) {
            console.log(`   ✅ ${client.nome} adicionado com sucesso`);
          } else {
            console.log(`   ❌ Erro ao adicionar ${client.nome}: ${addResponse.data.message}`);
          }
        } else {
          console.log(`   ❌ Erro ao registrar ${client.nome}: ${clientLoginResponse.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro ao adicionar ${client.nome}: ${error.response?.data?.message || error.message}`);
      }
      
      // Pequeno delay entre adições
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n5️⃣ Verificando clientes na fila...');
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
addClientsAsUser();
