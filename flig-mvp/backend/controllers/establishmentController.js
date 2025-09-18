/**
 * Controller de Estabelecimentos para Sistema Flig
 * 
 * Gerencia operações relacionadas aos estabelecimentos do sistema.
 * Inclui CRUD, perfil, estatísticas e operações específicas de estabelecimento.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const Establishment = require('../models/Establishment');
const Queue = require('../models/Queue');
const connection = require('../config/db');

/**
 * Obtém perfil do estabelecimento atual
 * 
 * GET /api/establishments/profile
 * Headers: { Authorization: Bearer <token> }
 */
async function getProfile(req, res) {
  try {
    const { userId } = req.user;

    const establishment = await Establishment.findById(userId);
    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    res.json({
      success: true,
      data: establishment.toPublicObject()
    });

  } catch (error) {
    console.error('❌ Erro ao obter perfil do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Atualiza perfil do estabelecimento
 * 
 * PUT /api/establishments/profile
 * Headers: { Authorization: Bearer <token> }
 * Body: { nome_empresa, cep_empresa, endereco_empresa, telefone_empresa, descricao, categoria, horario_funcionamento, capacidade_maxima }
 */
async function updateProfile(req, res) {
  try {
    const { userId } = req.user;
    const updateData = req.body;

    // Remove campos que não podem ser atualizados via perfil
    delete updateData.id;
    delete updateData.cnpj;
    delete updateData.email_empresa;
    delete updateData.senha_empresa;
    delete updateData.status;
    delete updateData.created_at;
    delete updateData.updated_at;

    const updatedEstablishment = await Establishment.update(userId, updateData);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedEstablishment.toPublicObject()
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Altera senha do estabelecimento
 * 
 * PUT /api/establishments/change-password
 * Headers: { Authorization: Bearer <token> }
 * Body: { currentPassword, newPassword }
 */
async function changePassword(req, res) {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Busca estabelecimento com senha
    const establishment = await Establishment.findById(userId);
    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Verifica senha atual
    const isCurrentPasswordValid = Establishment.validatePassword(currentPassword, establishment.senha_empresa);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualiza senha
    await Establishment.update(userId, { senha_empresa: newPassword });

    console.log(`✅ Senha alterada para estabelecimento ID: ${userId}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao alterar senha do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém estatísticas do estabelecimento
 * 
 * GET /api/establishments/stats
 * Headers: { Authorization: Bearer <token> }
 */
async function getEstablishmentStats(req, res) {
  try {
    console.log('🚀 getEstablishmentStats chamada');
    console.log('📋 req.user:', req.user);
    const { userId } = req.user;
    console.log('🔍 getEstablishmentStats - userId:', userId);

    // Verifica se o estabelecimento existe
    const establishment = await Establishment.findById(userId);
    if (!establishment) {
      console.log('❌ Estabelecimento não encontrado para userId:', userId);
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    console.log('✅ Estabelecimento encontrado:', establishment.nome_empresa);
    const stats = await Establishment.getStats(userId);
    console.log('📊 Stats obtidas:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém filas do estabelecimento
 * 
 * GET /api/establishments/queues
 * Headers: { Authorization: Bearer <token> }
 */
async function getEstablishmentQueues(req, res) {
  try {
    const { userId } = req.user;

    // Busca filas diretamente do banco
    const sql = `SELECT * FROM filas WHERE estabelecimento_id = ? ORDER BY created_at DESC`;

    const queues = await new Promise((resolve, reject) => {
      connection.query(sql, [userId], (err, results) => {
        if (err) {
          console.error('❌ Erro na consulta SQL das filas:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    res.json({
      success: true,
      data: queues
    });

  } catch (error) {
    console.error('❌ Erro ao obter filas do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém relatório diário do estabelecimento
 * 
 * GET /api/establishments/daily-report
 * Headers: { Authorization: Bearer <token> }
 * Query: { date }
 */
async function getDailyReport(req, res) {
  try {
    const { userId } = req.user;
    const { date = new Date().toISOString().split('T')[0] } = req.query;

    const sql = `
      SELECT 
        rd.*,
        f.nome as fila_nome
      FROM relatorios_diarios rd
      JOIN filas f ON rd.queue_id = f.id
      WHERE rd.estabelecimento_id = ? AND rd.data_relatorio = ?
      ORDER BY rd.created_at DESC
    `;

    const results = await new Promise((resolve, reject) => {
      connection.query(sql, [userId, date], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Calcula totais
    const totals = results.reduce((acc, report) => {
      acc.totalClientes += report.total_clientes || 0;
      acc.clientesAtendidos += report.clientes_atendidos || 0;
      acc.receitaTotal += parseFloat(report.receita_total) || 0;
      acc.totalAvancos += report.total_avancos || 0;
      return acc;
    }, {
      totalClientes: 0,
      clientesAtendidos: 0,
      receitaTotal: 0,
      totalAvancos: 0
    });

    res.json({
      success: true,
      data: {
        date,
        reports: results,
        totals
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter relatório diário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Lista estabelecimentos ativos (público)
 * 
 * GET /api/establishments
 * Query: { limit, offset, search, category }
 */
async function listEstablishments(req, res) {
  try {
    const { limit = 20, offset = 0, search = '', category = '' } = req.query;

    const establishments = await Establishment.findActive({ limit, offset, search, category });

    res.json({
      success: true,
      data: establishments.map(est => est.toPublicObject())
    });

  } catch (error) {
    console.error('❌ Erro ao listar estabelecimentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém estabelecimento por ID (público)
 * 
 * GET /api/establishments/:id
 */
async function getEstablishmentById(req, res) {
  try {
    const { id } = req.params;

    const establishment = await Establishment.findById(id);
    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Só retorna dados públicos
    res.json({
      success: true,
      data: establishment.toPublicObject()
    });

  } catch (error) {
    console.error('❌ Erro ao obter estabelecimento por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém filas ativas de um estabelecimento (público)
 * 
 * GET /api/establishments/:id/queues
 */
async function getEstablishmentQueuesPublic(req, res) {
  try {
    const { id } = req.params;

    // Verifica se estabelecimento existe e está ativo
    const establishment = await Establishment.findById(id);
    if (!establishment || establishment.status !== 'ativo') {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado ou inativo'
      });
    }

    const sql = `
      SELECT 
        f.id,
        f.nome,
        f.descricao,
        f.status,
        f.max_avancos,
        f.valor_avancos,
        f.tempo_estimado,
        f.created_at
      FROM filas f
      WHERE f.estabelecimento_id = ? AND f.status = 'ativa'
      ORDER BY f.created_at DESC
    `;

    const results = await new Promise((resolve, reject) => {
      connection.query(sql, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Erro ao obter filas do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Lista todos os estabelecimentos (admin)
 * 
 * GET /api/establishments/admin
 * Headers: { Authorization: Bearer <token> }
 * Query: { limit, offset, search, status }
 */
async function listAllEstablishments(req, res) {
  try {
    const { limit = 50, offset = 0, search = '', status = '' } = req.query;

    const establishments = await Establishment.findAll({ limit, offset, search, status });

    res.json({
      success: true,
      data: establishments.map(est => est.toPublicObject())
    });

  } catch (error) {
    console.error('❌ Erro ao listar todos os estabelecimentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Atualiza status do estabelecimento (admin)
 * 
 * PUT /api/establishments/:id/status
 * Headers: { Authorization: Bearer <token> }
 * Body: { status }
 */
async function updateEstablishmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status é obrigatório'
      });
    }

    const updatedEstablishment = await Establishment.updateStatus(id, status);

    res.json({
      success: true,
      message: 'Status do estabelecimento atualizado com sucesso',
      data: updatedEstablishment.toPublicObject()
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar status do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Remove estabelecimento (admin)
 * 
 * DELETE /api/establishments/:id
 * Headers: { Authorization: Bearer <token> }
 */
async function deleteEstablishment(req, res) {
  try {
    const { id } = req.params;

    await Establishment.delete(id);

    console.log(`✅ Estabelecimento removido: ID ${id}`);

    res.json({
      success: true,
      message: 'Estabelecimento removido com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Deleta conta do estabelecimento
 * 
 * DELETE /api/establishments/account
 * Headers: { Authorization: Bearer <token> }
 * Body: { password }
 */
async function deleteAccount(req, res) {
  try {
    const { userId } = req.user;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória para deletar a conta'
      });
    }

    // Busca estabelecimento com senha
    const establishment = await Establishment.findById(userId);
    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    // Verifica senha
    const isPasswordValid = Establishment.validatePassword(password, establishment.senha_empresa);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Remove estabelecimento
    await Establishment.delete(userId);

    console.log(`✅ Conta deletada: Estabelecimento ID ${userId}`);

    res.json({
      success: true,
      message: 'Conta deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar conta do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getEstablishmentStats,
  getEstablishmentQueues,
  getDailyReport,
  listEstablishments,
  getEstablishmentById,
  getEstablishmentQueuesPublic,
  listAllEstablishments,
  updateEstablishmentStatus,
  deleteEstablishment,
  deleteAccount
};
