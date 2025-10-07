/**
 * Serviço de Blacklist de Tokens para Sistema Flig
 * 
 * Gerencia tokens inválidos para logout real.
 * Armazena tokens na blacklist no Redis para verificação rápida.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const redisService = require('./redis');

/**
 * Adiciona token à blacklist
 * @param {string} token - Token JWT a ser invalidado
 * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 24h)
 */
async function addToBlacklist(token, expiresIn = 86400) {
  try {
    const client = await redisService.getRedisClient();
    const blacklistKey = `flig:blacklist:${token}`;
    
    // Adiciona token à blacklist com TTL
    await client.setEx(blacklistKey, expiresIn, 'true');
    
    console.log(`✅ Token adicionado à blacklist`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar token à blacklist:', error);
    throw error;
  }
}

/**
 * Verifica se token está na blacklist
 * @param {string} token - Token JWT a ser verificado
 * @returns {boolean} - True se token está na blacklist
 */
async function isTokenBlacklisted(token) {
  try {
    const client = await redisService.getRedisClient();
    const blacklistKey = `flig:blacklist:${token}`;
    
    const isBlacklisted = await client.get(blacklistKey);
    return isBlacklisted === 'true';
  } catch (error) {
    console.error('❌ Erro ao verificar blacklist:', error);
    return false; // Em caso de erro, assume que não está na blacklist
  }
}

/**
 * Remove token da blacklist (para casos especiais)
 * @param {string} token - Token a ser removido
 */
async function removeFromBlacklist(token) {
  try {
    const client = await redisService.getRedisClient();
    const blacklistKey = `flig:blacklist:${token}`;
    
    await client.del(blacklistKey);
    console.log(`✅ Token removido da blacklist`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover token da blacklist:', error);
    throw error;
  }
}

/**
 * Obtém estatísticas da blacklist
 * @returns {Object} - Estatísticas da blacklist
 */
async function getBlacklistStats() {
  try {
    const client = await redisService.getRedisClient();
    const pattern = 'flig:blacklist:*';
    
    const keys = await client.keys(pattern);
    
    return {
      totalBlacklistedTokens: keys.length
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas da blacklist:', error);
    return {
      totalBlacklistedTokens: 0
    };
  }
}

module.exports = {
  addToBlacklist,
  isTokenBlacklisted,
  removeFromBlacklist,
  getBlacklistStats
};
