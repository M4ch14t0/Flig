/**
 * Configuração do Banco de Dados MySQL para Sistema Flig
 * 
 * Centraliza todas as configurações de conexão e pool de conexões.
 * Inclui configurações para diferentes ambientes.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

// Garantir que dotenv seja carregado primeiro
require('dotenv').config();

const mysql = require('mysql2/promise');

// Configurações do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'flig_db',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  timezone: '+00:00',
  
  // Configurações do pool de conexões
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  idleTimeout: 300000,
  
  // Configurações de SSL (para produção)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  
  // Configurações de timezone
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Event listeners para monitoramento
pool.on('connection', (connection) => {
  console.log(`✅ Nova conexão MySQL estabelecida: ${connection.threadId}`);
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Tentando reconectar ao MySQL...');
  }
});

/**
 * Função para testar a conexão com o banco
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com MySQL estabelecida com sucesso');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    return false;
  }
}

/**
 * Função para executar queries com tratamento de erro
 */
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Função para executar transações
 */
async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [rows] = await connection.execute(sql, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Função para fechar o pool de conexões
 */
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Pool de conexões MySQL fechado');
  } catch (error) {
    console.error('❌ Erro ao fechar pool MySQL:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Fechando conexões MySQL...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Fechando conexões MySQL...');
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction,
  closePool
};

