/**
 * Utilitário para geração de UUIDs únicos
 * 
 * Este módulo fornece funções para gerar identificadores únicos
 * para filas, clientes e outras entidades do sistema Flig.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const { v4: uuidv4, v1: uuidv1 } = require('uuid');

/**
 * Gera um UUID v4 (aleatório) para filas
 * 
 * UUID v4 é ideal para filas pois:
 * - É completamente aleatório
 * - Não contém informações sobre tempo ou local
 * - Tem baixa probabilidade de colisão
 * 
 * @returns {string} - UUID v4 único
 */
function generateQueueId() {
  return uuidv4();
}

/**
 * Gera um UUID v4 para clientes na fila
 * 
 * @returns {string} - UUID v4 único para cliente
 */
function generateClientId() {
  return uuidv4();
}

/**
 * Gera um UUID v1 (baseado em timestamp) para sessões
 * 
 * UUID v1 é ideal para sessões pois:
 * - Contém timestamp de criação
 * - É ordenável cronologicamente
 * - Útil para debugging e logs
 * 
 * @returns {string} - UUID v1 único
 */
function generateSessionId() {
  return uuidv1();
}

/**
 * Gera um código curto para filas (6 caracteres alfanuméricos)
 * 
 * Útil para códigos que usuários precisam digitar manualmente
 * 
 * @returns {string} - Código de 6 caracteres
 */
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Valida se uma string é um UUID válido
 * 
 * @param {string} uuid - String a ser validada
 * @returns {boolean} - True se for um UUID válido
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Gera um token de acesso temporário para estabelecimentos
 * 
 * @returns {string} - Token de acesso único
 */
function generateAccessToken() {
  return uuidv4().replace(/-/g, '');
}

module.exports = {
  generateQueueId,
  generateClientId,
  generateSessionId,
  generateShortCode,
  isValidUUID,
  generateAccessToken
};

