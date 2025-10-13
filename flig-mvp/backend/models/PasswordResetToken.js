/**
 * Modelo para tokens de redefinição de senha
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const crypto = require('crypto');

class PasswordResetToken {
  constructor(data = {}) {
    this.id = data.id;
    this.userId = data.user_id;
    this.userType = data.user_type; // 'cliente' ou 'estabelecimento'
    this.token = data.token;
    this.expiresAt = data.expires_at;
    this.used = data.used || false;
    this.createdAt = data.created_at;
  }

  /**
   * Gera um token único para redefinição de senha
   * @returns {string} Token único
   */
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Cria um novo token de redefinição de senha
   * @param {number} userId - ID do usuário
   * @param {string} userType - Tipo do usuário ('cliente' ou 'estabelecimento')
   * @param {Object} connection - Conexão com o banco
   * @returns {Promise<PasswordResetToken>} Token criado
   */
  static async create(userId, userType, connection) {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO password_reset_tokens 
        (user_id, user_type, token, expires_at, used, created_at) 
        VALUES (?, ?, ?, ?, 0, NOW())
      `;
      
      connection.query(query, [userId, userType, token, expiresAt], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(new PasswordResetToken({
            id: result.insertId,
            user_id: userId,
            user_type: userType,
            token: token,
            expires_at: expiresAt,
            used: false,
            created_at: new Date()
          }));
        }
      });
    });
  }

  /**
   * Busca um token válido por token string
   * @param {string} token - Token string
   * @param {Object} connection - Conexão com o banco
   * @returns {Promise<PasswordResetToken|null>} Token encontrado ou null
   */
  static async findByToken(token, connection) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM password_reset_tokens 
        WHERE token = ? AND used = 0 AND expires_at > NOW()
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      connection.query(query, [token], (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length === 0) {
          resolve(null);
        } else {
          resolve(new PasswordResetToken(results[0]));
        }
      });
    });
  }

  /**
   * Marca um token como usado
   * @param {string} token - Token string
   * @param {Object} connection - Conexão com o banco
   * @returns {Promise<boolean>} Sucesso da operação
   */
  static async markAsUsed(token, connection) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE password_reset_tokens 
        SET used = 1 
        WHERE token = ?
      `;
      
      connection.query(query, [token], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      });
    });
  }

  /**
   * Remove tokens expirados
   * @param {Object} connection - Conexão com o banco
   * @returns {Promise<number>} Número de tokens removidos
   */
  static async cleanupExpired(connection) {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM password_reset_tokens 
        WHERE expires_at < NOW() OR used = 1
      `;
      
      connection.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows);
        }
      });
    });
  }

  /**
   * Verifica se o token é válido
   * @returns {boolean} True se válido
   */
  isValid() {
    return !this.used && new Date() < new Date(this.expiresAt);
  }
}

module.exports = PasswordResetToken;

