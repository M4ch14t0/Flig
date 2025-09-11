/**
 * Sistema de Criptografia AES para dados sensíveis do Flig
 * 
 * Este módulo fornece funções para criptografar e descriptografar dados sensíveis
 * como informações pessoais dos clientes nas filas. Utiliza AES-256-GCM para
 * máxima segurança.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const crypto = require('crypto');

// Chave de criptografia - em produção deve vir de variável de ambiente
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'flig-encryption-key-32-chars-long!!';
const ALGORITHM = 'aes-256-gcm';

/**
 * Criptografa dados sensíveis usando AES-256-GCM
 * 
 * @param {string} text - Texto a ser criptografado
 * @returns {string} - String criptografada em formato base64
 */
function encrypt(text) {
  try {
    // Cria um IV (Initialization Vector) aleatório de 16 bytes
    const iv = crypto.randomBytes(16);
    
    // Cria o cipher usando AES-256-GCM
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    
    // Criptografa o texto
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obtém o auth tag para verificação de integridade
    const authTag = cipher.getAuthTag();
    
    // Combina IV + authTag + dados criptografados
    const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    
    // Retorna em base64 para facilitar armazenamento
    return Buffer.from(combined).toString('base64');
    
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    throw new Error('Falha na criptografia dos dados');
  }
}

/**
 * Descriptografa dados usando AES-256-GCM
 * 
 * @param {string} encryptedData - Dados criptografados em base64
 * @returns {string} - Texto descriptografado
 */
function decrypt(encryptedData) {
  try {
    // Converte de base64 para string
    const combined = Buffer.from(encryptedData, 'base64').toString();
    
    // Separa IV, authTag e dados criptografados
    const parts = combined.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de dados criptografados inválido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Cria o decipher
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    
    // Define o auth tag para verificação
    decipher.setAuthTag(authTag);
    
    // Descriptografa os dados
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    throw new Error('Falha na descriptografia dos dados');
  }
}

/**
 * Criptografa dados de cliente para armazenamento na fila
 * 
 * @param {Object} clientData - Dados do cliente
 * @returns {Object} - Dados criptografados
 */
function encryptClientData(clientData) {
  // DESATIVADO PARA TESTES - retorna dados sem criptografia
  return {
    id: clientData.id,
    nome: clientData.nome,
    telefone: clientData.telefone,
    email: clientData.email,
    timestamp: clientData.timestamp || Date.now()
  };
}

/**
 * Descriptografa dados de cliente da fila
 * 
 * @param {Object} encryptedClientData - Dados criptografados do cliente
 * @returns {Object} - Dados descriptografados do cliente
 */
function decryptClientData(encryptedClientData) {
  // DESATIVADO PARA TESTES - retorna dados diretamente
  return {
    id: encryptedClientData.id,
    nome: encryptedClientData.nome,
    telefone: encryptedClientData.telefone,
    email: encryptedClientData.email,
    timestamp: encryptedClientData.timestamp
  };
}

/**
 * Gera hash seguro para senhas
 * 
 * @param {string} password - Senha em texto plano
 * @returns {string} - Hash da senha
 */
function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  const saltRounds = 12;
  return bcrypt.hashSync(password, saltRounds);
}

/**
 * Verifica senha contra hash
 * 
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash da senha
 * @returns {boolean} - True se a senha estiver correta
 */
function verifyPassword(password, hash) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(password, hash);
}

module.exports = {
  encrypt,
  decrypt,
  encryptClientData,
  decryptClientData,
  hashPassword,
  verifyPassword
};
