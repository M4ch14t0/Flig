#!/usr/bin/env node

/**
 * Script para Inserir Clientes na Fila do Railway
 * 
 * Este script simula clientes entrando na fila via API
 */

import axios from 'axios';

const RAILWAY_API_URL = 'https://flig-production.up.railway.app';
const QUEUE_ID = '43a5a297-e7db-4a25-8c4b-7d7e8d2af104';

async function insertClientsInQueue() {
  try {
    console.log('🚀 INSERINDO CLIENTES NA FILA DO RAILWAY');
    console.log('=======================================');
    console.log(`🌐 API URL: ${RAILWAY_API_URL}`);
    console.log(`🆔 Queue ID: ${QUEUE_ID}`);
    
    // Dados dos clientes
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
    
    console.log(`\n👥 Inserindo ${clientes.length} clientes na fila...`);
    
    let clientesInseridos = 0;
    let clientesComErro = 0;
    
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i];
      
      try {
        console.log(`\n📝 Processando ${i + 1}/${clientes.length}: ${cliente.nome}`);
        
        // Primeiro, registrar o cliente no sistema
        console.log(`  🔐 Registrando cliente ${cliente.nome}...`);
        
        const registerResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/register/user`, {
          nome_usuario: cliente.nome,
          email_usuario: cliente.email,
          senha_usuario: '123456', // Senha padrão para clientes de teste
          telefone: cliente.telefone
        });
        
        console.log(`  ✅ Cliente ${cliente.nome} registrado`);
        
        // Fazer login como cliente
        console.log(`  🔑 Fazendo login como ${cliente.nome}...`);
        
        const loginResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/login/user`, {
          email_usuario: cliente.email,
          senha_usuario: '123456'
        });
        
        const clientToken = loginResponse.data.data.token;
        console.log(`  ✅ Login realizado para ${cliente.nome}`);
        
        // Entrar na fila
        console.log(`  🚶 ${cliente.nome} entrando na fila...`);
        
        const joinResponse = await axios.post(`${RAILWAY_API_URL}/api/queues/${QUEUE_ID}/join`, {
          nome_cliente: cliente.nome,
          email_cliente: cliente.email,
          telefone_cliente: cliente.telefone
        }, {
          headers: {
            'Authorization': `Bearer ${clientToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`  ✅ ${cliente.nome} adicionado à fila com sucesso!`);
        console.log(`  📊 Posição: ${joinResponse.data.data?.posicao || 'N/A'}`);
        clientesInseridos++;
        
        // Pequena pausa entre inserções
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`  ❌ Erro ao inserir ${cliente.nome}:`);
        
        if (error.response?.status === 409) {
          console.log(`    ⚠️ Cliente já existe no sistema`);
          
          // Tentar fazer login mesmo assim
          try {
            const loginResponse = await axios.post(`${RAILWAY_API_URL}/api/auth/login/user`, {
              email_usuario: cliente.email,
              senha_usuario: '123456'
            });
            
            const clientToken = loginResponse.data.data.token;
            
            const joinResponse = await axios.post(`${RAILWAY_API_URL}/api/queues/${QUEUE_ID}/join`, {
              nome_cliente: cliente.nome,
              email_cliente: cliente.email,
              telefone_cliente: cliente.telefone
            }, {
              headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log(`    ✅ ${cliente.nome} adicionado à fila (cliente existente)!`);
            console.log(`    📊 Posição: ${joinResponse.data.data?.posicao || 'N/A'}`);
            clientesInseridos++;
            
          } catch (loginError) {
            console.log(`    ❌ Erro no login: ${loginError.response?.data?.message || loginError.message}`);
            clientesComErro++;
          }
          
        } else {
          console.log(`    ❌ ${error.response?.data?.message || error.message}`);
          clientesComErro++;
        }
      }
    }
    
    // Verificar estado final da fila
    console.log('\n🔍 Verificando estado final da fila...');
    
    try {
      const queueResponse = await axios.get(`${RAILWAY_API_URL}/api/queues/${QUEUE_ID}`);
      console.log('📊 Estado da fila:', queueResponse.data);
    } catch (statusError) {
      console.log('⚠️ Erro ao verificar estado da fila:', statusError.response?.data?.message || statusError.message);
    }
    
    console.log('\n📊 RESUMO FINAL');
    console.log('================');
    console.log(`🌐 Servidor: ${RAILWAY_API_URL}`);
    console.log(`🆔 ID da Fila: ${QUEUE_ID}`);
    console.log(`👥 Clientes processados: ${clientes.length}`);
    console.log(`✅ Clientes inseridos: ${clientesInseridos}`);
    console.log(`❌ Clientes com erro: ${clientesComErro}`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    console.log('1. Acesse: https://flig.vercel.app');
    console.log('2. Faça login com: testeestab@email.com / Abcd1234');
    console.log('3. Vá para a seção de filas');
    console.log('4. A fila estará populada com os clientes');
    
    console.log('\n✅ Inserção de clientes concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar script
insertClientsInQueue();
