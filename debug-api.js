#!/usr/bin/env node

/**
 * Script de Debug para API Flig
 * 
 * Este script testa os endpoints da API para identificar problemas
 * de autenticação, CORS, Redis, etc.
 */

const axios = require('axios');

// Configuração
const API_BASE_URL = process.env.API_URL || 'https://flig-backend-production.up.railway.app';
const TEST_EMAIL = 'teste@flig.com';
const TEST_PASSWORD = '123456';

console.log('🔍 Iniciando debug da API Flig...');
console.log(`📍 URL da API: ${API_BASE_URL}`);

async function testHealthCheck() {
  try {
    console.log('\n1️⃣ Testando Health Check...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check OK:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health Check falhou:', error.message);
    return false;
  }
}

async function testCORS() {
  try {
    console.log('\n2️⃣ Testando CORS...');
    const response = await axios.options(`${API_BASE_URL}/api/queues`, {
      headers: {
        'Origin': 'https://flig.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    console.log('✅ CORS OK:', response.headers);
    return true;
  } catch (error) {
    console.log('❌ CORS falhou:', error.message);
    return false;
  }
}

async function testLogin() {
  try {
    console.log('\n3️⃣ Testando Login...');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      userType: 'estabelecimento'
    });
    
    if (response.data.success && response.data.token) {
      console.log('✅ Login OK - Token recebido');
      return response.data.token;
    } else {
      console.log('❌ Login falhou:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login falhou:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateQueue(token) {
  try {
    console.log('\n4️⃣ Testando Criação de Fila...');
    const response = await axios.post(`${API_BASE_URL}/api/queues`, {
      nome: 'Fila de Teste',
      estabelecimento_id: 1,
      descricao: 'Fila para teste de debug',
      max_avancos: 3,
      valor_avancos: 1.50,
      tempo_estimado: 5
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Criação de fila OK:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Criação de fila falhou:');
    console.log('   Status:', error.response?.status);
    console.log('   Data:', error.response?.data);
    console.log('   Headers:', error.response?.headers);
    return false;
  }
}

async function testRedisConnection() {
  try {
    console.log('\n5️⃣ Testando Conexão Redis...');
    const response = await axios.get(`${API_BASE_URL}/api/queues`);
    console.log('✅ Redis OK - Endpoint acessível');
    return true;
  } catch (error) {
    console.log('❌ Redis falhou:', error.response?.data || error.message);
    return false;
  }
}

async function runDebug() {
  console.log('🚀 Iniciando testes de debug...\n');
  
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ API não está respondendo. Verifique se o backend está rodando.');
    return;
  }
  
  const corsOk = await testCORS();
  const token = await testLogin();
  
  if (token) {
    await testCreateQueue(token);
  } else {
    console.log('\n⚠️ Não foi possível obter token. Testando endpoints sem autenticação...');
    await testRedisConnection();
  }
  
  console.log('\n🏁 Debug concluído!');
}

// Executar debug
runDebug().catch(console.error);
