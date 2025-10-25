const connection = require('./config/db');
const cryptoUtils = require('./utils/crypto');

async function createTestUser() {
  try {
    console.log('🔍 Criando usuário de teste...');
    
    const testEmail = 'teste@teste.com';
    const testPassword = '123456';
    
    // Verificar se usuário já existe
    const existingUsers = await new Promise((resolve, reject) => {
      connection.query('SELECT id FROM usuarios WHERE email_usuario = ?', [testEmail], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (existingUsers.length > 0) {
      console.log('⚠️ Usuário já existe, deletando...');
      await new Promise((resolve, reject) => {
        connection.query('DELETE FROM usuarios WHERE email_usuario = ?', [testEmail], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    }
    
    // Criar hash da senha
    const hashedPassword = cryptoUtils.hashPassword(testPassword);
    console.log('🔐 Hash criado:', hashedPassword);
    
    // Inserir usuário
    const result = await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO usuarios (nome_usuario, cpf, email_usuario, senha_usuario, telefone_usuario) VALUES (?, ?, ?, ?, ?)',
        ['Usuário Teste', '12345678901', testEmail, hashedPassword, '11999999999'],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    
    console.log('✅ Usuário criado com ID:', result.insertId);
    console.log('📧 Email:', testEmail);
    console.log('🔑 Senha:', testPassword);
    
    // Testar login
    console.log('\n🔍 Testando login...');
    const isValid = cryptoUtils.verifyPassword(testPassword, hashedPassword);
    console.log('✅ Verificação de senha:', isValid ? 'VÁLIDA' : 'INVÁLIDA');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    connection.end();
  }
}

createTestUser();

