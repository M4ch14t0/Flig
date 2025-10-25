const axios = require('axios');

async function testCors() {
  try {
    console.log('🔍 Testando CORS...');
    
    // Teste 1: Health check
    console.log('\n1. Testando health check...');
    const healthResponse = await axios.get('http://localhost:5000/api/health', {
      headers: {
        'Origin': 'http://localhost:3001'
      }
    });
    console.log('✅ Health check:', healthResponse.data);
    
    // Teste 2: Login para obter token válido
    console.log('\n2. Testando login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login/user', {
      email_usuario: 'rafaelmo10@outlook.com.br',
      senha_usuario: 'Abcd1234'
    }, {
      headers: {
        'Origin': 'http://localhost:3001',
        'Content-Type': 'application/json'
      }
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login realizado:', token.substring(0, 20) + '...');
      
      // Teste 3: Active queues com token válido
      console.log('\n3. Testando active-queues...');
      const activeQueuesResponse = await axios.get('http://localhost:5000/api/users/active-queues', {
        headers: {
          'Origin': 'http://localhost:3001',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Active queues:', activeQueuesResponse.data);
      
    } else {
      console.log('❌ Login falhou:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testCors();

