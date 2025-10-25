const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testando login com usuário de teste...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login/user', {
      email_usuario: 'teste@teste.com',
      senha_usuario: '123456'
    }, {
      headers: {
        'Origin': 'http://localhost:3001',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Login realizado com sucesso!');
      console.log('Token:', response.data.data.token.substring(0, 20) + '...');
      
      // Testar active-queues com o token
      console.log('\n🔍 Testando active-queues...');
      const activeQueuesResponse = await axios.get('http://localhost:5000/api/users/active-queues', {
        headers: {
          'Origin': 'http://localhost:3001',
          'Authorization': `Bearer ${response.data.data.token}`
        }
      });
      
      console.log('✅ Active queues:', activeQueuesResponse.data);
      
    } else {
      console.log('❌ Login falhou:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testLogin();

