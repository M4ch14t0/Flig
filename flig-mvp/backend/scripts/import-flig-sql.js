const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuração da conexão Railway
const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 44946,
  user: 'root',
  password: 'XCqoKSCLQrvnDtQTmRnNyAOXrSsIieAz',
  database: 'railway',
  charset: 'utf8mb4',
  multipleStatements: true // Permite executar múltiplas queries
};

async function importFligSQL() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao Railway MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao Railway MySQL!');

    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '../database/Flig.sql');
    console.log('📄 Lendo arquivo SQL:', sqlFilePath);
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('📊 Tamanho do arquivo SQL:', sqlContent.length, 'caracteres');

    // Executar o SQL
    console.log('🚀 Executando importação do banco completo...');
    console.log('⏳ Isso pode levar alguns minutos...');
    
    await connection.execute(sqlContent);
    
    console.log('✅ Importação do banco completo concluída!');

    // Verificar tabelas criadas
    console.log('📊 Verificando tabelas criadas...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas no banco:', tables.map(t => Object.values(t)[0]));

    // Verificar dados nas tabelas principais
    console.log('📊 Verificando dados...');
    
    const [estabelecimentos] = await connection.execute('SELECT COUNT(*) as total FROM estabelecimentos');
    console.log('🏢 Estabelecimentos:', estabelecimentos[0].total);

    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    console.log('👥 Usuários:', usuarios[0].total);

    const [filas] = await connection.execute('SELECT COUNT(*) as total FROM filas');
    console.log('📋 Filas:', filas[0].total);

    const [planos] = await connection.execute('SELECT COUNT(*) as total FROM planos');
    console.log('💳 Planos:', planos[0].total);

    const [historico] = await connection.execute('SELECT COUNT(*) as total FROM historico_clientes_filas');
    console.log('📈 Histórico:', historico[0].total);

    console.log('🎉 Migração completa do banco Railway concluída com sucesso!');
    console.log('🚀 Agora você pode fazer o deploy do backend!');

  } catch (error) {
    console.error('❌ Erro na importação:', error.message);
    console.error('❌ Código do erro:', error.code);
    
    if (error.code === 'ER_TABLE_EXISTS') {
      console.log('⚠️ Algumas tabelas já existem, continuando...');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ Alguns dados já existem, continuando...');
    } else {
      console.error('❌ Erro crítico:', error);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

importFligSQL();




