/**
 * Gerenciador de Sessões para Sistema Flig
 * 
 * Gerencia sessões ativas, logout automático e validação de tokens
 * para evitar conflitos entre usuários.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import connection from '../config/db.js';

class SessionManager {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-super-secreta';
    this.SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  }

  /**
   * Cria uma nova sessão para o usuário
   * @param {Object} user - Dados do usuário
   * @param {string} deviceInfo - Informações do dispositivo
   * @param {string} ipAddress - Endereço IP
   * @returns {Object} - Token e dados da sessão
   */
  async createSession(user, deviceInfo = '', ipAddress = '') {
    try {
      // Invalidar sessões anteriores do mesmo usuário
      await this.invalidateUserSessions(user.id, user.userType);

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          userType: user.userType,
          sessionId: crypto.randomUUID()
        },
        this.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Hash do token para armazenamento seguro
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Calcular expiração
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      // Salvar sessão no banco
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO user_sessions 
           (user_id, user_type, token_hash, device_info, ip_address, expires_at) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [user.id, user.userType, tokenHash, deviceInfo, ipAddress, expiresAt],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });

      console.log(`✅ Nova sessão criada para ${user.userType} ID: ${user.id}`);

      return {
        token,
        expiresAt,
        sessionId: tokenHash
      };
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      throw new Error('Falha ao criar sessão');
    }
  }

  /**
   * Valida um token e retorna dados da sessão
   * @param {string} token - Token JWT
   * @returns {Object} - Dados da sessão se válida
   */
  async validateSession(token) {
    try {
      // Verificar se token está na blacklist
      const tokenBlacklist = await import('./tokenBlacklist.js');
      if (await tokenBlacklist.isBlacklisted(token)) {
        throw new Error('Token inválido');
      }

      // Decodificar token
      const decoded = jwt.verify(token, this.JWT_SECRET);
      
      // Verificar se sessão existe e está ativa
      const session = await new Promise((resolve, reject) => {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        connection.query(
          `SELECT * FROM user_sessions 
           WHERE token_hash = ? AND is_active = 1 AND expires_at > NOW()`,
          [tokenHash],
          (err, results) => err ? reject(err) : resolve(results[0])
        );
      });

      if (!session) {
        throw new Error('Sessão não encontrada ou expirada');
      }

      // Verificar se usuário ainda está ativo
      const userStatus = await this.getUserStatus(decoded.userId, decoded.userType);
      if (userStatus !== 'active') {
        await this.invalidateSession(token);
        throw new Error('Usuário inativo');
      }

      // Atualizar última atividade
      await this.updateLastActivity(session.id);

      return {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType,
        sessionId: session.id
      };
    } catch (error) {
      console.error('❌ Erro ao validar sessão:', error);
      throw new Error('Sessão inválida');
    }
  }

  /**
   * Invalida todas as sessões de um usuário
   * @param {number} userId - ID do usuário
   * @param {string} userType - Tipo do usuário
   */
  async invalidateUserSessions(userId, userType) {
    try {
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE user_sessions 
           SET is_active = 0 
           WHERE user_id = ? AND user_type = ? AND is_active = 1`,
          [userId, userType],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });

      console.log(`🔄 Sessões anteriores invalidadas para ${userType} ID: ${userId}`);
    } catch (error) {
      console.error('❌ Erro ao invalidar sessões:', error);
    }
  }

  /**
   * Invalida uma sessão específica
   * @param {string} token - Token da sessão
   */
  async invalidateSession(token) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE user_sessions 
           SET is_active = 0 
           WHERE token_hash = ?`,
          [tokenHash],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });

      // Adicionar token à blacklist
      const tokenBlacklist = await import('./tokenBlacklist.js');
      await tokenBlacklist.addToBlacklist(token);

      console.log('🔄 Sessão invalidada');
    } catch (error) {
      console.error('❌ Erro ao invalidar sessão:', error);
    }
  }

  /**
   * Verifica status do usuário
   * @param {number} userId - ID do usuário
   * @param {string} userType - Tipo do usuário
   * @returns {string} - Status do usuário
   */
  async getUserStatus(userId, userType) {
    try {
      const table = userType === 'cliente' ? 'usuarios' : 'estabelecimentos';
      const result = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT status FROM ${table} WHERE id = ?`,
          [userId],
          (err, results) => err ? reject(err) : resolve(results[0])
        );
      });

      return result ? result.status : 'inactive';
    } catch (error) {
      console.error('❌ Erro ao verificar status do usuário:', error);
      return 'inactive';
    }
  }

  /**
   * Atualiza última atividade da sessão
   * @param {number} sessionId - ID da sessão
   */
  async updateLastActivity(sessionId) {
    try {
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE user_sessions 
           SET last_activity = NOW() 
           WHERE id = ?`,
          [sessionId],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
    }
  }

  /**
   * Limpa sessões expiradas
   */
  async cleanupExpiredSessions() {
    try {
      const result = await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE user_sessions 
           SET is_active = 0 
           WHERE expires_at < NOW() AND is_active = 1`,
          (err, result) => err ? reject(err) : resolve(result)
        );
      });

      if (result.affectedRows > 0) {
        console.log(`🧹 ${result.affectedRows} sessões expiradas removidas`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar sessões:', error);
    }
  }

  /**
   * Obtém sessões ativas de um usuário
   * @param {number} userId - ID do usuário
   * @param {string} userType - Tipo do usuário
   * @returns {Array} - Lista de sessões ativas
   */
  async getUserActiveSessions(userId, userType) {
    try {
      const sessions = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT id, device_info, ip_address, created_at, last_activity 
           FROM user_sessions 
           WHERE user_id = ? AND user_type = ? AND is_active = 1 AND expires_at > NOW() 
           ORDER BY last_activity DESC`,
          [userId, userType],
          (err, results) => err ? reject(err) : resolve(results)
        );
      });

      return sessions;
    } catch (error) {
      console.error('❌ Erro ao obter sessões:', error);
      return [];
    }
  }
}

const sessionManager = new SessionManager();
export default sessionManager;
