#!/usr/bin/env node

/**
 * Script para Solicitar População no Railway via API (Corrigido)
 * 
 * Este script faz uma requisição HTTP para o backend Railway para criar fila
 */

import axios from 'axios';

const RAILWAY_API_URL = 'https://flig-production.up.railway.app';

async function requestRailwayPopulate() {
  try {
    console.log('🚀 SOLICITANDO POPULAÇÃO NO RAILWAY VIA API (CORRIGIDO)');
    console.log('=====================================================');
    console.log(`🌐 API URL: ${RAILWAY_API_URL}`);
    
    // Fazer login para obter token e dados do usuário
    console.log('\n🔐 Fazendo login...');
    
    const loginResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/login/establishment`, {
      email_empresa: 'testeestab@email.com',
      senha_empresa: 'Abcd1234'
    });
    
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    
    console.log('✅ Login realizado com sucesso!');
    console.log(`👤 Usuário ID: ${userId}`);
    console.log(`🏢 Nome: ${loginResponse.data.data.user.nome_empresa}`);
    
    // Criar fila com o ID do estabelecimento
    console.log('\n📋 Criando fila...');
    
    const queueData = {
      nome: 'Fila Teste Railway API',
      descricao: 'Fila criada via API do Railway',
      tempo_estimado: 5,
      max_avancos: 5,
      valor_avancos: 2.00,
      estabelecimento_id: userId
    };
    
    const queueResponse = await axios.post(`${RAILWAY_API_URL}/api/queues`, queueData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Fila criada via API!');
    console.log('📊 Dados da fila:', queueResponse.data);
    
    const queueId = queueResponse.data.data.id;
    console.log(`🆔 ID da Fila: ${queueId}`);
    
    // Adicionar clientes à fila
    console.log('\n👥 Adicionando clientes à fila...');
    
    const clientes = [
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
    ];
    
    let clientesAdicionados = 0;
    
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i];
      
      try {
        const clientResponse = await axios.post(`${RAILWAY_API_URL}/api/queues/${queueId}/join`, {
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
        clientesAdicionados++;
        
      } catch (clientError) {
        console.log(`  ⚠️ Erro ao adicionar ${cliente.nome}:`, clientError.response?.data?.message || clientError.message);
      }
    }
    
    // Verificar estado da fila
    console.log('\n🔍 Verificando estado da fila...');
    
    try {
      const queueStatusResponse = await axios.get(`${RAILWAY_API_URL}/api/queues/${queueId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Estado da fila:', queueStatusResponse.data);
    } catch (statusError) {
      console.log('⚠️ Erro ao verificar estado da fila:', statusError.response?.data?.message || statusError.message);
    }
    
    console.log('\n📊 RESUMO FINAL');
    console.log('================');
    console.log(`🌐 Servidor: ${RAILWAY_API_URL}`);
    console.log(`👤 Usuário ID: ${userId}`);
    console.log(`📧 Email: testeestab@email.com`);
    console.log(`🔑 Senha: Abcd1234`);
    console.log(`🆔 ID da Fila: ${queueId}`);
    console.log(`📝 Nome da Fila: Fila Teste Railway API`);
    console.log(`👥 Clientes adicionados: ${clientesAdicionados}/${clientes.length}`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    console.log('1. Acesse: https://flig.vercel.app');
    console.log('2. Faça login com: testeestab@email.com / Abcd1234');
    console.log('3. Vá para a seção de filas');
    console.log('4. A fila estará disponível para gerenciamento');
    
    console.log('\n✅ População via API concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
    console.log('\n📝 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se o servidor Railway está online');
    console.log('2. Verificar as credenciais de acesso');
    console.log('3. Executar o script diretamente no servidor Railway');
  }
}

// Executar script
requestRailwayPopulate();
