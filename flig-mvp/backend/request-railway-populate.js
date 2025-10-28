#!/usr/bin/env node

/**
 * Script para Solicitar População no Railway via API
 * 
 * Este script faz uma requisição HTTP para o backend Railway para criar usuário e popular fila
 */

import axios from 'axios';

const RAILWAY_API_URL = 'https://flig-production.up.railway.app';

async function requestRailwayPopulate() {
  try {
    console.log('🚀 SOLICITANDO POPULAÇÃO NO RAILWAY VIA API');
    console.log('==========================================');
    console.log(`🌐 API URL: ${RAILWAY_API_URL}`);
    
    // Primeiro, tentar fazer login para verificar se o usuário existe
    console.log('\n🔍 Verificando se usuário testeestab@email.com existe...');
    
    try {
      const loginResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/login/establishment`, {
        email_empresa: 'testeestab@email.com',
        senha_empresa: 'Abcd1234'
      });
      
      console.log('✅ Usuário já existe e login funcionou!');
      console.log('📊 Dados do usuário:', loginResponse.data);
      
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        console.log('❌ Usuário não existe ou credenciais inválidas');
        console.log('📝 Será necessário criar o usuário manualmente no Railway');
      } else {
        console.log('⚠️ Erro ao verificar login:', loginError.message);
      }
    }
    
    // Tentar criar uma fila via API (se o usuário existir)
    console.log('\n📋 Tentando criar fila via API...');
    
    try {
      // Primeiro fazer login para obter token
      const loginResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/login/establishment`, {
        email_empresa: 'testeestab@email.com',
        senha_empresa: 'Abcd1234'
      });
      
      const token = loginResponse.data.data.token;
      console.log('✅ Token obtido com sucesso');
      
      // Criar fila
      const queueData = {
        nome: 'Fila Teste Railway API',
        descricao: 'Fila criada via API do Railway',
        tempo_estimado: 5,
        max_avancos: 5,
        valor_avancos: 2.00
      };
      
      const queueResponse = await axios.post(`${RAILWAY_API_URL}/api/queues`, queueData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Fila criada via API:', queueResponse.data);
      
      const queueId = queueResponse.data.data.id;
      console.log(`🆔 ID da Fila: ${queueId}`);
      
      // Adicionar alguns clientes à fila
      console.log('\n👥 Adicionando clientes à fila...');
      
      const clientes = [
        { nome: 'João Silva', email: 'joao@teste.com', telefone: '11999990001' },
        { nome: 'Maria Santos', email: 'maria@teste.com', telefone: '11999990002' },
        { nome: 'Pedro Oliveira', email: 'pedro@teste.com', telefone: '11999990003' },
        { nome: 'Ana Costa', email: 'ana@teste.com', telefone: '11999990004' },
        { nome: 'Carlos Lima', email: 'carlos@teste.com', telefone: '11999990005' }
      ];
      
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
        } catch (clientError) {
          console.log(`  ⚠️ Erro ao adicionar ${cliente.nome}:`, clientError.response?.data?.message || clientError.message);
        }
      }
      
      console.log('\n📊 RESUMO FINAL');
      console.log('================');
      console.log(`🌐 Servidor: ${RAILWAY_API_URL}`);
      console.log(`📧 Email: testeestab@email.com`);
      console.log(`🔑 Senha: Abcd1234`);
      console.log(`🆔 ID da Fila: ${queueId}`);
      console.log(`📝 Nome da Fila: Fila Teste Railway API`);
      console.log(`👥 Clientes adicionados: ${clientes.length}`);
      
      console.log('\n🎯 PRÓXIMOS PASSOS');
      console.log('==================');
      console.log('1. Acesse: https://flig.vercel.app');
      console.log('2. Faça login com: testeestab@email.com / Abcd1234');
      console.log('3. Vá para a seção de filas');
      console.log('4. A fila estará disponível para gerenciamento');
      
      console.log('\n✅ População via API concluída com sucesso!');
      
    } catch (apiError) {
      console.log('❌ Erro na API:', apiError.response?.data || apiError.message);
      console.log('\n📝 SOLUÇÃO ALTERNATIVA:');
      console.log('1. Acesse o painel do Railway');
      console.log('2. Vá para o console do banco de dados');
      console.log('3. Execute os scripts SQL manualmente');
      console.log('4. Ou use o script populate-railway-queue.js no servidor Railway');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.log('\n📝 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se o servidor Railway está online');
    console.log('2. Verificar as credenciais de acesso');
    console.log('3. Executar o script diretamente no servidor Railway');
  }
}

// Executar script
requestRailwayPopulate();
