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
    
    pool.execute(sql, params)
      .then(([rows]) => {
        if (callback) callback(null, rows);
      })
      .catch((error) => {
        if (callback) callback(error, null);
      });
  }
};

// Testar conexão na inicialização (após carregar dotenv)
testConnection();

module.exports = connection;

