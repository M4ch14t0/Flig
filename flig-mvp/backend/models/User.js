/**
 * Model de Usuário para Sistema Flig
 * 
 * Gerencia operações relacionadas aos usuários (clientes) do sistema.
 * Inclui CRUD básico, validações e operações específicas de usuário.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const connection = require('../config/db');
const cryptoUtils = require('../utils/crypto');

class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nome_usuario = data.nome_usuario || '';
    this.cpf = data.cpf || '';
    this.telefone_usuario = data.telefone_usuario || '';
    this.email_usuario = data.email_usuario || '';
    this.senha_usuario = data.senha_usuario || '';
    this.cep_usuario = data.cep_usuario || '';
    this.endereco_usuario = data.endereco_usuario || '';
    this.numero_usuario = data.numero_usuario || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<User>} - Usuário criado
   */
  static async create(userData) {
    try {
      // Criptografa a senha
      const hashedPassword = cryptoUtils.hashPassword(userData.senha_usuario);

      const sql = `
        INSERT INTO usuarios 
        (nome_usuario, cpf, telefone_usuario, email_usuario, senha_usuario, cep_usuario, endereco_usuario, numero_usuario)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        userData.nome_usuario,
        userData.cpf,
        userData.telefone_usuario,
        userData.email_usuario,
        hashedPassword,
        userData.cep_usuario,
        userData.endereco_usuario,
        userData.numero_usuario
      ];

      const result = await new Promise((resolve, reject) => {
        connection.query(sql, values, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      console.log(`✅ Usuário criado: ${userData.nome_usuario} (ID: ${result.insertId})`);
      return await User.findById(result.insertId);

    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   * @param {number} id - ID do usuário
   * @returns {Promise<User|null>} - Usuário encontrado ou null
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM usuarios WHERE id = ?';
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (results.length === 0) return null;
      return new User(results[0]);

    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por email
   * @param {string} email - Email do usuário
   * @returns {Promise<User|null>} - Usuário encontrado ou null
   */
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM usuarios WHERE email_usuario = ?';
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [email], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (results.length === 0) return null;
      return new User(results[0]);

    } catch (error) {
      console.error('❌ Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por CPF
   * @param {string} cpf - CPF do usuário
   * @returns {Promise<User|null>} - Usuário encontrado ou null
   */
  static async findByCPF(cpf) {
    try {
      const sql = 'SELECT * FROM usuarios WHERE cpf = ?';
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [cpf], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (results.length === 0) return null;
      return new User(results[0]);

    } catch (error) {
      console.error('❌ Erro ao buscar usuário por CPF:', error);
      throw error;
    }
  }

  /**
   * Lista todos os usuários
   * @param {Object} options - Opções de paginação e filtros
   * @returns {Promise<Array>} - Lista de usuários
   */
  static async findAll(options = {}) {
    try {
      const { limit = 50, offset = 0, search = '' } = options;
      
      let sql = 'SELECT id, nome_usuario, cpf, telefone_usuario, email_usuario, cep_usuario, endereco_usuario, numero_usuario, created_at FROM usuarios';
      let params = [];

      if (search) {
        sql += ' WHERE nome_usuario LIKE ? OR email_usuario LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return results.map(row => new User(row));

    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      throw error;
    }
  }

  /**
   * Atualiza dados do usuário
   * @param {number} id - ID do usuário
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<User>} - Usuário atualizado
   */
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'nome_usuario', 'telefone_usuario', 'email_usuario', 
        'cep_usuario', 'endereco_usuario', 'numero_usuario'
      ];

      const fields = [];
      const values = [];

      // Se senha for fornecida, criptografa
      if (updateData.senha_usuario) {
        updateData.senha_usuario = cryptoUtils.hashPassword(updateData.senha_usuario);
        allowedFields.push('senha_usuario');
      }

      // Prepara campos para atualização
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('Nenhum campo válido para atualização');
      }

      values.push(id);
      const sql = `UPDATE usuarios SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;

      await new Promise((resolve, reject) => {
        connection.query(sql, values, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      console.log(`✅ Usuário atualizado: ID ${id}`);
      return await User.findById(id);

    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Remove usuário
   * @param {number} id - ID do usuário
   * @returns {Promise<boolean>} - True se removido com sucesso
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM usuarios WHERE id = ?';
      const result = await new Promise((resolve, reject) => {
        connection.query(sql, [id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      if (result.affectedRows === 0) {
        throw new Error('Usuário não encontrado');
      }

      console.log(`✅ Usuário removido: ID ${id}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao remover usuário:', error);
      throw error;
    }
  }

  /**
   * Verifica se email já existe
   * @param {string} email - Email para verificar
   * @param {number} excludeId - ID do usuário a excluir da verificação
   * @returns {Promise<boolean>} - True se email existe
   */
  static async emailExists(email, excludeId = null) {
    try {
      let sql = 'SELECT id FROM usuarios WHERE email_usuario = ?';
      let params = [email];

      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return results.length > 0;

    } catch (error) {
      console.error('❌ Erro ao verificar email:', error);
      throw error;
    }
  }

  /**
   * Verifica se CPF já existe
   * @param {string} cpf - CPF para verificar
   * @param {number} excludeId - ID do usuário a excluir da verificação
   * @returns {Promise<boolean>} - True se CPF existe
   */
  static async cpfExists(cpf, excludeId = null) {
    try {
      let sql = 'SELECT id FROM usuarios WHERE cpf = ?';
      let params = [cpf];

      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return results.length > 0;

    } catch (error) {
      console.error('❌ Erro ao verificar CPF:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do usuário
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} - Estatísticas do usuário
   */
  static async getStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(DISTINCT hcf.queue_id) as total_filas_participadas,
          COUNT(CASE WHEN hcf.status = 'atendido' THEN 1 END) as total_atendimentos,
          COUNT(CASE WHEN hcf.status = 'aguardando' THEN 1 END) as filas_ativas,
          SUM(CASE WHEN hcf.status = 'atendido' THEN hcf.valor_pago ELSE 0 END) as total_gasto,
          AVG(CASE WHEN hcf.status = 'atendido' THEN hcf.tempo_espera ELSE NULL END) as tempo_medio_espera
        FROM historico_clientes_filas hcf
        WHERE hcf.client_id IN (
          SELECT CONCAT('client-', id) FROM usuarios WHERE id = ?
        )
      `;

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [userId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return {
        totalFilasParticipadas: results[0].total_filas_participadas || 0,
        totalAtendimentos: results[0].total_atendimentos || 0,
        filasAtivas: results[0].filas_ativas || 0,
        totalGasto: parseFloat(results[0].total_gasto) || 0,
        tempoMedioEspera: parseFloat(results[0].tempo_medio_espera) || 0
      };

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do usuário:', error);
      throw error;
    }
  }

  /**
   * Valida senha do usuário
   * @param {string} password - Senha em texto plano
   * @param {string} hashedPassword - Senha criptografada
   * @returns {boolean} - True se senha é válida
   */
  static validatePassword(password, hashedPassword) {
    return cryptoUtils.verifyPassword(password, hashedPassword);
  }

  /**
   * Converte para objeto público (sem dados sensíveis)
   * @returns {Object} - Dados públicos do usuário
   */
  toPublicObject() {
    return {
      id: this.id,
      nome_usuario: this.nome_usuario,
      email_usuario: this.email_usuario,
      telefone_usuario: this.telefone_usuario,
      cep_usuario: this.cep_usuario,
      endereco_usuario: this.endereco_usuario,
      numero_usuario: this.numero_usuario,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = User;

