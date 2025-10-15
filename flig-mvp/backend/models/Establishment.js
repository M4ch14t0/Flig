/**
 * Model de Estabelecimento para Sistema Flig
 * 
 * Gerencia operações relacionadas aos estabelecimentos do sistema.
 * Inclui CRUD básico, validações e operações específicas de estabelecimento.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const connection = require('../config/db');
const cryptoUtils = require('../utils/crypto');

class Establishment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nome_empresa = data.nome_empresa || '';
    this.cnpj = data.cnpj || '';
    this.cep_empresa = data.cep_empresa || '';
    this.endereco_empresa = data.endereco_empresa || '';
    this.bairro_empresa = data.bairro_empresa || '';
    this.cidade_empresa = data.cidade_empresa || '';
    this.uf_empresa = data.uf_empresa || '';
    this.numero_empresa = data.numero_empresa || '';
    this.telefone_empresa = data.telefone_empresa || '';
    this.email_empresa = data.email_empresa || '';
    this.senha_empresa = data.senha_empresa || '';
    this.descricao = data.descricao_empresa || data.descricao || '';
    this.imagem_empresa = data.imagem_empresa || null;
    this.categoria = data.categoria || '';
    this.horario_funcionamento = data.horario_funcionamento || '';
    this.capacidade_maxima = data.capacidade_maxima || 100;
    this.status = data.status || 'ativo';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Cria um novo estabelecimento
   * @param {Object} establishmentData - Dados do estabelecimento
   * @returns {Promise<Establishment>} - Estabelecimento criado
   */
  static async create(establishmentData) {
    try {
      // Criptografa a senha
      const hashedPassword = cryptoUtils.hashPassword(establishmentData.senha_empresa);

      const sql = `
        INSERT INTO estabelecimentos 
        (nome_empresa, cnpj, cep_empresa, endereco_empresa, telefone_empresa, email_empresa, senha_empresa, descricao, categoria, horario_funcionamento, capacidade_maxima)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        establishmentData.nome_empresa,
        establishmentData.cnpj,
        establishmentData.cep_empresa,
        establishmentData.endereco_empresa,
        establishmentData.telefone_empresa,
        establishmentData.email_empresa,
        hashedPassword,
        establishmentData.descricao,
        establishmentData.categoria,
        establishmentData.horario_funcionamento,
        establishmentData.capacidade_maxima || 100
      ];

      const result = await new Promise((resolve, reject) => {
        connection.query(sql, values, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      console.log(`✅ Estabelecimento criado: ${establishmentData.nome_empresa} (ID: ${result.insertId})`);
      return await Establishment.findById(result.insertId);

    } catch (error) {
      console.error('❌ Erro ao criar estabelecimento:', error);
      throw error;
    }
  }

  /**
   * Busca estabelecimento por ID
   * @param {number} id - ID do estabelecimento
   * @returns {Promise<Establishment|null>} - Estabelecimento encontrado ou null
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM estabelecimentos WHERE id = ?';
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [id], (err, results) => {
          if (err) {
            console.error('❌ Erro na consulta SQL:', err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      if (results.length === 0) {
        return null;
      }
      
      return new Establishment(results[0]);

    } catch (error) {
      console.error('❌ Erro ao buscar estabelecimento por ID:', error);
      throw error;
    }
  }

  /**
   * Busca estabelecimento por email
   * @param {string} email - Email do estabelecimento
   * @returns {Promise<Establishment|null>} - Estabelecimento encontrado ou null
   */
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM estabelecimentos WHERE email_empresa = ?';
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [email], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (results.length === 0) return null;
      return new Establishment(results[0]);

    } catch (error) {
      console.error('❌ Erro ao buscar estabelecimento por email:', error);
      throw error;
    }
  }

  /**
   * Busca estabelecimento por CNPJ
   * @param {string} cnpj - CNPJ do estabelecimento
   * @returns {Promise<Establishment|null>} - Estabelecimento encontrado ou null
   */
  static async findByCNPJ(cnpj) {
    try {
      const sql = 'SELECT * FROM estabelecimentos WHERE cnpj = ?';
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [cnpj], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (results.length === 0) return null;
      return new Establishment(results[0]);

    } catch (error) {
      console.error('❌ Erro ao buscar estabelecimento por CNPJ:', error);
      throw error;
    }
  }

  /**
   * Lista estabelecimentos ativos
   * @param {Object} options - Opções de paginação e filtros
   * @returns {Promise<Array>} - Lista de estabelecimentos
   */
  static async findActive(options = {}) {
    try {
      const { limit = 50, offset = 0, search = '', category = '' } = options;
      
      let sql = `
        SELECT id, nome_empresa, cnpj, cep_empresa, endereco_empresa, telefone_empresa, 
               email_empresa, descricao_empresa, categoria, horario_funcionamento, capacidade_maxima, 
               status, created_at, updated_at
        FROM estabelecimentos 
        WHERE status = 'ativo'
      `;
      let params = [];

      if (search) {
        sql += ' AND (nome_empresa LIKE ? OR descricao_empresa LIKE ? OR categoria LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (category) {
        sql += ' AND categoria = ?';
        params.push(category);
      }

      sql += ' ORDER BY nome_empresa ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return results.map(row => new Establishment(row));

    } catch (error) {
      console.error('❌ Erro ao listar estabelecimentos ativos:', error);
      throw error;
    }
  }

  /**
   * Lista todos os estabelecimentos (admin)
   * @param {Object} options - Opções de paginação e filtros
   * @returns {Promise<Array>} - Lista de estabelecimentos
   */
  static async findAll(options = {}) {
    try {
      const { limit = 50, offset = 0, search = '', status = '' } = options;
      
      let sql = `
        SELECT id, nome_empresa, cnpj, cep_empresa, endereco_empresa, telefone_empresa, 
               email_empresa, descricao, categoria, horario_funcionamento, capacidade_maxima, 
               status, created_at, updated_at
        FROM estabelecimentos
      `;
      let params = [];

      if (search) {
        sql += ' WHERE (nome_empresa LIKE ? OR descricao LIKE ? OR categoria LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status) {
        sql += search ? ' AND' : ' WHERE';
        sql += ' status = ?';
        params.push(status);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return results.map(row => new Establishment(row));

    } catch (error) {
      console.error('❌ Erro ao listar estabelecimentos:', error);
      throw error;
    }
  }

  /**
   * Atualiza dados do estabelecimento
   * @param {number} id - ID do estabelecimento
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Establishment>} - Estabelecimento atualizado
   */
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'nome_empresa', 'cep_empresa', 'endereco_empresa', 'telefone_empresa', 
        'email_empresa', 'descricao', 'descricao_empresa', 'imagem_empresa',
        'bairro_empresa', 'cidade_empresa', 'uf_empresa', 'numero_empresa',
        'categoria', 'horario_funcionamento', 'capacidade_maxima', 'status'
      ];

      const fields = [];
      const values = [];

      // Se senha for fornecida, criptografa
      if (updateData.senha_empresa) {
        updateData.senha_empresa = cryptoUtils.hashPassword(updateData.senha_empresa);
        allowedFields.push('senha_empresa');
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
      const sql = `UPDATE estabelecimentos SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;

      await new Promise((resolve, reject) => {
        connection.query(sql, values, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      console.log(`✅ Estabelecimento atualizado: ID ${id}`);
      return await Establishment.findById(id);

    } catch (error) {
      console.error('❌ Erro ao atualizar estabelecimento:', error);
      throw error;
    }
  }

  /**
   * Remove estabelecimento
   * @param {number} id - ID do estabelecimento
   * @returns {Promise<boolean>} - True se removido com sucesso
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM estabelecimentos WHERE id = ?';
      const result = await new Promise((resolve, reject) => {
        connection.query(sql, [id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      if (result.affectedRows === 0) {
        throw new Error('Estabelecimento não encontrado');
      }

      console.log(`✅ Estabelecimento removido: ID ${id}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao remover estabelecimento:', error);
      throw error;
    }
  }

  /**
   * Verifica se email já existe
   * @param {string} email - Email para verificar
   * @param {number} excludeId - ID do estabelecimento a excluir da verificação
   * @returns {Promise<boolean>} - True se email existe
   */
  static async emailExists(email, excludeId = null) {
    try {
      let sql = 'SELECT id FROM estabelecimentos WHERE email_empresa = ?';
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
   * Verifica se CNPJ já existe
   * @param {string} cnpj - CNPJ para verificar
   * @param {number} excludeId - ID do estabelecimento a excluir da verificação
   * @returns {Promise<boolean>} - True se CNPJ existe
   */
  static async cnpjExists(cnpj, excludeId = null) {
    try {
      let sql = 'SELECT id FROM estabelecimentos WHERE cnpj = ?';
      let params = [cnpj];

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
      console.error('❌ Erro ao verificar CNPJ:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do estabelecimento
   * @param {number} establishmentId - ID do estabelecimento
   * @returns {Promise<Object>} - Estatísticas do estabelecimento
   */
  static async getStats(establishmentId) {
    try {
      console.log('🔍 getStats chamada para establishmentId:', establishmentId);
      
      // Query melhorada para incluir dados reais do histórico
      const sql = `
        SELECT 
          COUNT(DISTINCT f.id) as total_filas,
          COUNT(DISTINCT CASE WHEN f.status = 'ativa' THEN f.id END) as filas_ativas,
          SUM(f.total_clientes_atendidos) as total_clientes_atendidos,
          SUM(f.receita_total) as receita_total,
          AVG(f.tempo_estimado) as tempo_medio_estimado,
          COUNT(DISTINCT hcf.client_id) as total_clientes_unicos,
          COUNT(CASE WHEN hcf.status IN ('atendido', 'chamado') THEN 1 END) as total_atendidos_real,
          COUNT(CASE WHEN hcf.status = 'abandonou' THEN 1 END) as total_abandonos,
          AVG(CASE 
            WHEN hcf.status = 'atendido' AND hcf.data_saida IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, hcf.data_entrada, hcf.data_saida) 
          END) as tempo_medio_real
        FROM estabelecimentos e
        LEFT JOIN filas f ON e.id = f.estabelecimento_id
        LEFT JOIN historico_clientes_filas hcf ON f.id = hcf.queue_id
        WHERE e.id = ?
      `;

      console.log('🔍 Executando query SQL para establishmentId:', establishmentId);
      console.log('📝 Query SQL:', sql);

      // Primeiro, vamos verificar se há dados na tabela historico_clientes_filas
      const checkHistorySql = `
        SELECT COUNT(*) as total_records, 
               COUNT(CASE WHEN status IN ('atendido', 'chamado') THEN 1 END) as atendidos,
               COUNT(CASE WHEN status = 'abandonou' THEN 1 END) as abandonos,
               COUNT(CASE WHEN status = 'chamado' THEN 1 END) as chamados,
               COUNT(CASE WHEN status = 'atendido' THEN 1 END) as finalizados
        FROM historico_clientes_filas hcf
        JOIN filas f ON hcf.queue_id = f.id
        WHERE f.estabelecimento_id = ?
      `;
      
      console.log('🔍 Verificando dados do histórico...');
      const historyCheck = await new Promise((resolve, reject) => {
        connection.query(checkHistorySql, [establishmentId], (err, results) => {
          if (err) {
            console.error('❌ Erro ao verificar histórico:', err);
            reject(err);
          } else {
            console.log('📊 Dados do histórico encontrados:', results[0]);
            resolve(results);
          }
        });
      });

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [establishmentId], (err, results) => {
          if (err) {
            console.error('❌ Erro na query SQL:', err);
            reject(err);
          } else {
            console.log('📊 Resultados brutos da query:', results);
            resolve(results);
          }
        });
      });

      console.log('📊 Resultado da query para establishmentId', establishmentId, ':', results[0]);

      const stats = {
        totalFilas: results[0].total_filas || 0,
        filasAtivas: results[0].filas_ativas || 0,
        totalClientesAtendidos: results[0].total_atendidos_real || results[0].total_clientes_atendidos || 0,
        receitaTotal: parseFloat(results[0].receita_total) || 0,
        tempoMedioEstimado: parseFloat(results[0].tempo_medio_estimado) || 0,
        tempoMedioReal: parseFloat(results[0].tempo_medio_real) || 0,
        totalClientesUnicos: results[0].total_clientes_unicos || 0,
        totalAbandonos: results[0].total_abandonos || 0
      };

      console.log('📊 Stats calculadas:', stats);
      console.log('🔍 Detalhes dos campos:');
      console.log('  - total_atendidos_real:', results[0].total_atendidos_real);
      console.log('  - total_clientes_atendidos:', results[0].total_clientes_atendidos);
      console.log('  - total_abandonos:', results[0].total_abandonos);
      console.log('  - tempo_medio_real:', results[0].tempo_medio_real);
      
      return stats;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do estabelecimento:', error);
      throw error;
    }
  }

  /**
   * Obtém filas do estabelecimento
   * @param {number} establishmentId - ID do estabelecimento
   * @returns {Promise<Array>} - Lista de filas
   */
  static async getQueues(establishmentId) {
    try {
      const sql = `
        SELECT f.*, 
               COUNT(hcf.id) as total_clientes_historico,
               COUNT(CASE WHEN hcf.status = 'aguardando' THEN 1 END) as clientes_aguardando
        FROM filas f
        LEFT JOIN historico_clientes_filas hcf ON f.id = hcf.queue_id
        WHERE f.estabelecimento_id = ?
        GROUP BY f.id
        ORDER BY f.created_at DESC
      `;

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [establishmentId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return results;

    } catch (error) {
      console.error('❌ Erro ao obter filas do estabelecimento:', error);
      throw error;
    }
  }

  /**
   * Atualiza status do estabelecimento
   * @param {number} id - ID do estabelecimento
   * @param {string} status - Novo status
   * @returns {Promise<Establishment>} - Estabelecimento atualizado
   */
  static async updateStatus(id, status) {
    try {
      const validStatuses = ['ativo', 'inativo', 'suspenso'];
      if (!validStatuses.includes(status)) {
        throw new Error('Status inválido');
      }

      const sql = 'UPDATE estabelecimentos SET status = ?, updated_at = NOW() WHERE id = ?';
      await new Promise((resolve, reject) => {
        connection.query(sql, [status, id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      console.log(`✅ Status do estabelecimento atualizado: ID ${id} -> ${status}`);
      return await Establishment.findById(id);

    } catch (error) {
      console.error('❌ Erro ao atualizar status do estabelecimento:', error);
      throw error;
    }
  }

  /**
   * Valida senha do estabelecimento
   * @param {string} password - Senha em texto plano
   * @param {string} hashedPassword - Senha criptografada
   * @returns {boolean} - True se senha é válida
   */
  static validatePassword(password, hashedPassword) {
    return cryptoUtils.verifyPassword(password, hashedPassword);
  }

  /**
   * Converte para objeto público (sem dados sensíveis)
   * @returns {Object} - Dados públicos do estabelecimento
   */
  toPublicObject() {
    return {
      id: this.id,
      nome_empresa: this.nome_empresa,
      cnpj: this.cnpj,
      cep_empresa: this.cep_empresa,
      endereco_empresa: this.endereco_empresa,
      bairro_empresa: this.bairro_empresa,
      cidade_empresa: this.cidade_empresa,
      uf_empresa: this.uf_empresa,
      numero_empresa: this.numero_empresa,
      telefone_empresa: this.telefone_empresa,
      email_empresa: this.email_empresa,
      descricao: this.descricao,
      descricao_empresa: this.descricao, // Adicionar campo para compatibilidade
      imagem_empresa: this.imagem_empresa ? true : null, // Indica se há imagem, sem retornar o BLOB
      categoria: this.categoria,
      horario_funcionamento: this.horario_funcionamento,
      capacidade_maxima: this.capacidade_maxima,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Establishment;

