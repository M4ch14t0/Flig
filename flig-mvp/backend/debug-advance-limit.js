const axios = require('axios');

// Configuração da API
const API_BASE = 'http://localhost:5000/api';

// Dados do cliente de teste
const clientCredentials = {
  email_usuario: 'cepteste@teste.com',
  senha_usuario: 'Abcd1234'
};

let clientToken = '';

async function loginClient() {
  try {
    console.log('🔐 Fazendo login do cliente...');
    const response = await axios.post(`${API_BASE}/auth/login/user`, clientCredentials);
    clientToken = response.data.data.token;
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    return false;
  }
}

async function getActiveQueues() {
  try {
    console.log('📋 Buscando filas ativas do cliente...');
    const response = await axios.get(`${API_BASE}/users/active-queues`, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    
    console.log('📊 Dados das filas:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar filas:', error.response?.data || error.message);
    return [];
  }
}

async function debugAdvanceLimit() {
  console.log('🔍 DEBUG: LIMITE DE AVANÇOS');
  console.log('============================\n');

  // 1. Login do cliente
  const loginSuccess = await loginClient();
  if (!loginSuccess) {
    console.log('❌ Não foi possível fazer login. Abortando teste.');
    return;
  }

  // 2. Buscar filas ativas
  const queues = await getActiveQueues();
  
  if (queues.length === 0) {
    console.log('❌ Nenhuma fila ativa encontrada para o cliente.');
    return;
  }

  // 3. Analisar cada fila
  for (const queue of queues) {
    console.log(`\n📋 FILA: ${queue.fila_nome}`);
    console.log('==================');
    console.log(`ID: ${queue.id}`);
    console.log(`Posição atual: ${queue.posicao_atual}`);
    console.log(`Total de pessoas na fila: ${queue.total_pessoas_fila}`);
    console.log(`Max avanços (estabelecimento): ${queue.max_avancos}`);
    
    // Calcular limite como no frontend (nova lógica corrigida)
    const establishmentLimit = queue.max_avancos || 8;
    const maxAdvanceByPosition = queue.posicao_atual - 1;
    const maxAdvance = Math.max(1, Math.min(establishmentLimit, maxAdvanceByPosition));
    
    console.log(`\n🧮 CÁLCULO DO LIMITE:`);
    console.log(`Limite do estabelecimento: ${establishmentLimit}`);
    console.log(`Max avanços por posição: ${maxAdvanceByPosition}`);
    console.log(`Limite calculado: ${maxAdvance}`);
    
    if (maxAdvance <= 0) {
      console.log('❌ PROBLEMA: Limite de avanços é 0 ou negativo!');
      console.log(`   - Posição atual: ${queue.posicao_atual}`);
      console.log(`   - Max avanços por posição: ${maxAdvanceByPosition}`);
    } else {
      console.log('✅ Limite de avanços OK');
    }
  }
}

// Executar debug
debugAdvanceLimit().catch(console.error);
