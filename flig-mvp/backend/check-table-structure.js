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

async function checkTable() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('🔍 Verificando estrutura da tabela filas...');
  const [rows] = await connection.execute('DESCRIBE filas');
  
  console.log('\n📋 Estrutura da tabela filas:');
  rows.forEach(row => {
    console.log(`- ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key ? `(${row.Key})` : ''}`);
  });
  
  console.log('\n🔍 Verificando filas existentes...');
  const [filas] = await connection.execute('SELECT id, nome, status, created_at FROM filas ORDER BY created_at DESC LIMIT 5');
  
  console.log('\n📊 Últimas 5 filas:');
  filas.forEach(fila => {
    console.log(`- ${fila.nome} (${fila.id}) - Status: ${fila.status} - Criada: ${fila.created_at}`);
  });
  
  await connection.end();
}

checkTable().catch(console.error);
