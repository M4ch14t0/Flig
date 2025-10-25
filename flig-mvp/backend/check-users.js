const connection = require('./config/db');

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco...');
    
    const users = await new Promise((resolve, reject) => {
      connection.query('SELECT id, nome_usuario, email_usuario FROM usuarios LIMIT 5', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('📊 Usuários encontrados:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Nome: ${user.nome_usuario}, Email: ${user.email_usuario}`);
    });
    
    // Verificar se o usuário específico existe
    const specificUser = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM usuarios WHERE email_usuario = ?', ['rafaelmo10@outlook.com.br'], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (specificUser.length > 0) {
      console.log('\n✅ Usuário encontrado:', specificUser[0]);
    } else {
      console.log('\n❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    connection.end();
  }
}

checkUsers();

