const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '@Azpx3050',
  database: process.env.DB_NAME || 'flig_db',
  charset: 'utf8mb4'
};

async function setupProduction() {
  try {
    console.log('🔧 Configurando ambiente de produção...');
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão com MySQL estabelecida');

    // Verificar se as tabelas existem
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Tabelas encontradas: ${tables.length}`);

    // Verificar configurações de produção
    const [settings] = await connection.execute('SELECT * FROM filas LIMIT 1');
    console.log('✅ Tabela filas acessível');

    // Configurar índices para performance
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_filas_estabelecimento 
      ON filas(estabelecimento_id)
    `);

    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_usuarios_email 
      ON usuarios(email_usuario)
    `);

    console.log('✅ Índices de performance criados');

    await connection.end();
    console.log('🎉 Configuração de produção concluída!');

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    process.exit(1);
  }
}

setupProduction();
