const connection = require('./config/db');
const cryptoUtils = require('./utils/crypto');

async function testPassword() {
  try {
    console.log('🔍 Testando verificação de senha...');
    
    // Buscar usuário específico
    const users = await new Promise((resolve, reject) => {
      connection.query('SELECT id, nome_usuario, email_usuario, senha_usuario FROM usuarios WHERE email_usuario = ?', ['rafaelmo10@outlook.com.br'], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (users.length === 0) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    const user = users[0];
    console.log('👤 Usuário encontrado:', user.nome_usuario);
    console.log('📧 Email:', user.email_usuario);
    console.log('🔐 Hash no banco:', user.senha_usuario);
    
    // Testar diferentes senhas
    const passwords = ['Abcd1234', '123456', 'password', 'senha123', 'rafael123'];
    
    for (const password of passwords) {
      console.log(`\n🔑 Testando senha: ${password}`);
      try {
        const isValid = cryptoUtils.verifyPassword(password, user.senha_usuario);
        console.log(`✅ Resultado: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        
        if (isValid) {
          console.log('🎉 SENHA ENCONTRADA!');
          break;
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar: ${error.message}`);
      }
    }
    
    // Testar com bcrypt diretamente
    console.log('\n🔍 Testando com bcrypt diretamente...');
    const bcrypt = require('bcryptjs');
    
    for (const password of passwords) {
      try {
        const isValid = bcrypt.compareSync(password, user.senha_usuario);
        console.log(`🔑 ${password}: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        
        if (isValid) {
          console.log('🎉 SENHA ENCONTRADA COM BCRYPT!');
          break;
        }
      } catch (error) {
        console.log(`❌ Erro bcrypt: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    connection.end();
  }
}

testPassword();

