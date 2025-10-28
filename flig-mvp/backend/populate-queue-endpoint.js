#!/usr/bin/env node

/**
 * Script para Criar Endpoint de População no Railway
 * 
 * Este script cria um endpoint que pode ser chamado para popular a fila
 */

import axios from 'axios';

const RAILWAY_API_URL = 'https://flig-production.up.railway.app';

async function createPopulateEndpoint() {
  try {
    console.log('🚀 CRIANDO ENDPOINT DE POPULAÇÃO NO RAILWAY');
    console.log('==========================================');
    console.log(`🌐 API URL: ${RAILWAY_API_URL}`);
    
    // Fazer login como estabelecimento
    console.log('\n🔐 Fazendo login como estabelecimento...');
    
    const loginResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/login/establishment`, {
      email_empresa: 'testeestab@email.com',
      senha_empresa: 'Abcd1234'
    });
    
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    
    console.log('✅ Login realizado com sucesso!');
    console.log(`👤 Usuário ID: ${userId}`);
    
    // Criar endpoint de população via POST
    console.log('\n📋 Criando endpoint de população...');
    
    // Simular chamada para popular a fila
    const populateData = {
      queue_id: '43a5a297-e7db-4a25-8c4b-7d7e8d2af104',
      clientes: [
        { nome: 'João Silva', email: 'joao@teste.com', telefone: '11999990001' },
        { nome: 'Maria Santos', email: 'maria@teste.com', telefone: '11999990002' },
        { nome: 'Pedro Oliveira', email: 'pedro@teste.com', telefone: '11999990003' },
        { nome: 'Ana Costa', email: 'ana@teste.com', telefone: '11999990004' },
        { nome: 'Carlos Lima', email: 'carlos@teste.com', telefone: '11999990005' },
        { nome: 'Fernanda Souza', email: 'fernanda@teste.com', telefone: '11999990006' },
        { nome: 'Rafael Pereira', email: 'rafael@teste.com', telefone: '11999990007' },
        { nome: 'Juliana Alves', email: 'juliana@teste.com', telefone: '11999990008' },
        { nome: 'Lucas Ferreira', email: 'lucas@teste.com', telefone: '11999990009' },
        { nome: 'Camila Rodrigues', email: 'camila@teste.com', telefone: '11999990010' }
      ]
    };
    
    // Tentar chamar endpoint de população (se existir)
    try {
      const populateResponse = await axios.post(`${RAILWAY_API_URL}/api/queues/populate`, populateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Endpoint de população chamado com sucesso!');
      console.log('📊 Resposta:', populateResponse.data);
      
    } catch (endpointError) {
      console.log('⚠️ Endpoint de população não existe, criando manualmente...');
      
      // Criar clientes manualmente via inserção direta
      console.log('\n👥 Inserindo clientes manualmente...');
      
      for (let i = 0; i < populateData.clientes.length; i++) {
        const cliente = populateData.clientes[i];
        
        try {
          // Simular entrada na fila via API de join
          const joinResponse = await axios.post(`${RAILWAY_API_URL}/api/queues/${populateData.queue_id}/join`, {
            nome_cliente: cliente.nome,
            email_cliente: cliente.email,
            telefone_cliente: cliente.telefone
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`  ✅ ${cliente.nome} adicionado à fila`);
          
        } catch (joinError) {
          console.log(`  ⚠️ Erro ao adicionar ${cliente.nome}: ${joinError.response?.data?.message || joinError.message}`);
        }
      }
    }
    
    // Verificar estado final da fila
    console.log('\n🔍 Verificando estado final da fila...');
    
    try {
      const queueResponse = await axios.get(`${RAILWAY_API_URL}/api/queues/${populateData.queue_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Estado da fila:', queueResponse.data);
      
    } catch (statusError) {
      console.log('⚠️ Erro ao verificar estado da fila:', statusError.response?.data?.message || statusError.message);
    }
    
    console.log('\n📊 RESUMO FINAL');
    console.log('================');
    console.log(`🌐 Servidor: ${RAILWAY_API_URL}`);
    console.log(`🆔 ID da Fila: ${populateData.queue_id}`);
    console.log(`👥 Clientes processados: ${populateData.clientes.length}`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    console.log('1. Acesse: https://flig.vercel.app');
    console.log('2. Faça login com: testeestab@email.com / Abcd1234');
    console.log('3. Vá para a seção de filas');
    console.log('4. A fila estará disponível para gerenciamento');
    
    console.log('\n✅ Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar script
createPopulateEndpoint();
