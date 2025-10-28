import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'containers-us-west-201.railway.app',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Azpx3050@',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
};

async function checkStructure() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('🔍 Verificando estrutura da tabela estabelecimentos...');
  const [rows] = await connection.execute('DESCRIBE estabelecimentos');
  
  console.log('\n📋 Estrutura da tabela estabelecimentos:');
  rows.forEach(row => {
    console.log(`- ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key ? `(${row.Key})` : ''} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
  });
  
  console.log('\n🔍 Verificando estabelecimentos existentes...');
  const [establishments] = await connection.execute('SELECT id, nome_empresa, email_empresa, cnpj, status FROM estabelecimentos LIMIT 3');
  
  console.log('\n📊 Exemplos de estabelecimentos:');
  establishments.forEach(est => {
    console.log(`- ${est.nome_empresa} (${est.email_empresa}) - CNPJ: ${est.cnpj} - Status: ${est.status}`);
  });
  
  await connection.end();
}

checkStructure().catch(console.error);
