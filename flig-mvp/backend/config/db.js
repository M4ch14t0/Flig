// db.js
// Garantir que dotenv seja carregado primeiro
require('dotenv').config();

// Importar configuração do banco de dados
const { pool, testConnection } = require('./database');

// Manter compatibilidade com código existente
const connection = {
  query: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Converter parâmetros para o formato correto
    const formattedParams = Array.isArray(params) ? params : [];
    
    // SEMPRE usar pool.query para evitar problemas com prepared statements
    // Substituir parâmetros diretamente na query
    let processedSql = sql;
    if (formattedParams.length > 0) {
      formattedParams.forEach((param, index) => {
        const replacement = typeof param === 'string' ? `'${param}'` : param;
        processedSql = processedSql.replace('?', replacement);
      });
    }
    
    // Logs removidos para produção
    
    pool.query(processedSql)
      .then(([rows, fields]) => {
        if (callback) callback(null, rows);
      })
      .catch((error) => {
        console.error('❌ Erro na query:', error);
        if (callback) callback(error, null);
      });
  }
};

// Testar conexão na inicialização (após carregar dotenv)
testConnection();

module.exports = connection;

