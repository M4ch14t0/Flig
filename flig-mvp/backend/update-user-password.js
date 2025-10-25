const connection = require('./config/db');
const cryptoUtils = require('./utils/crypto');

async function updateUserPassword() {
  try {
    console.log('🔍 Atualizando senha do usuário...');
    
    const email = 'rafaelmo10@outlook.com.br';
    const newPassword = 'Abcd1234';
    
    // Criar hash da nova senha
    const hashedPassword = cryptoUtils.hashPassword(newPassword);
    console.log('🔐 Novo hash criado:', hashedPassword);
    
    // Atualizar senha no banco
    const result = await new Promise((resolve, reject) => {
      connection.query(
        'UPDATE usuarios SET senha_usuario = ? WHERE email_usuario = ?',
        [hashedPassword, email],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    
    if (result.affectedRows > 0) {
      console.log('✅ Senha atualizada com sucesso!');
      console.log('📧 Email:', email);
      console.log('🔑 Nova senha:', newPassword);
      
      // Testar a nova senha
      const isValid = cryptoUtils.verifyPassword(newPassword, hashedPassword);
      console.log('✅ Verificação da nova senha:', isValid ? 'VÁLIDA' : 'INVÁLIDA');
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    connection.end();
  }
}

updateUserPassword();

