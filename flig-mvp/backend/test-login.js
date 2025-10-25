const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testando login...');
    
    const passwords = ['Abcd1234', '123456', 'password', 'senha123'];
    
    for (const password of passwords) {
      try {
        console.log(`\n🔑 Testando senha: ${password}`);
        const response = await axios.post('http://localhost:5000/api/auth/login/user', {
          email_usuario: 'rafaelmo10@outlook.com.br',
          senha_usuario: password
        }, {
          headers: {
            'Origin': 'http://localhost:3001',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          console.log('✅ Login realizado com sucesso!');
          console.log('Token:', response.data.token.substring(0, 20) + '...');
          return response.data.token;
        } else {
          console.log('❌ Login falhou:', response.data.message);
        }
      } catch (error) {
        console.log('❌ Erro:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testLogin();

