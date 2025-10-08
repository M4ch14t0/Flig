/**
 * Controller de Usuários para Sistema Flig
 * 
 * Gerencia operações relacionadas aos usuários (clientes) do sistema.
 * Inclui CRUD, perfil, estatísticas e operações específicas de usuário.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const User = require('../models/User');
const connection = require('../config/db');

/**
 * Obtém perfil do usuário atual
 * 
 * GET /api/users/profile
 * Headers: { Authorization: Bearer <token> }
 */
async function getProfile(req, res) {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user.toPublicObject()
    });

  } catch (error) {
    console.error('❌ Erro ao obter perfil do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Atualiza perfil do usuário
 * 
 * PUT /api/users/profile
 * Headers: { Authorization: Bearer <token> }
 * Body: { nome_usuario, telefone_usuario, cep_usuario, endereco_usuario, numero_usuario }
 */
async function updateProfile(req, res) {
  try {
    const { userId } = req.user;
    const updateData = req.body;

    // Remove campos que não podem ser atualizados via perfil
    delete updateData.id;
    delete updateData.email_usuario;
    delete updateData.cpf;
    delete updateData.senha_usuario;
    delete updateData.created_at;
    delete updateData.updated_at;

    const updatedUser = await User.update(userId, updateData);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser.toPublicObject()
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Altera senha do usuário
 * 
 * PUT /api/users/change-password
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

    // Busca usuário com senha
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verifica senha atual
    const isCurrentPasswordValid = User.validatePassword(currentPassword, user.senha_usuario);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualiza senha
    await User.update(userId, { senha_usuario: newPassword });

    console.log(`✅ Senha alterada para usuário ID: ${userId}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao alterar senha do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém estatísticas do usuário
 * 
 * GET /api/users/stats
 * Headers: { Authorization: Bearer <token> }
 */
async function getUserStats(req, res) {
  try {
    const { userId } = req.user;

    const stats = await User.getStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém histórico de filas do usuário
 * 
 * GET /api/users/queue-history
 * Headers: { Authorization: Bearer <token> }
 * Query: { limit, offset, status }
 */
async function getQueueHistory(req, res) {
  try {
    const { userId } = req.user;
    const { limit = 20, offset = 0, status = '' } = req.query;

    let sql = `
      SELECT 
        hcf.*,
        f.nome as fila_nome,
        e.nome_empresa as estabelecimento_nome
      FROM historico_clientes_filas hcf
      JOIN filas f ON hcf.queue_id = f.id
      JOIN estabelecimentos e ON f.estabelecimento_id = e.id
      WHERE hcf.client_id = ?
    `;
    let params = [`client-${userId}`];

    if (status) {
      sql += ' AND hcf.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY hcf.data_entrada DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const results = await new Promise((resolve, reject) => {
      connection.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      success: true,
      data: {
        history: results,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: results.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter histórico de filas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém filas ativas do usuário
 * 
 * GET /api/users/active-queues
 * Headers: { Authorization: Bearer <token> }
 */
async function getActiveQueues(req, res) {
  try {
    const { userId, email } = req.user;
    const redisService = require('../services/redis');
    
    console.log(`🔍 Buscando filas ativas para usuário: ID ${userId}, Email: ${email}`);
    
    // Buscar todas as filas ativas
    const allQueues = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT 
          f.id as queue_id,
          f.nome as fila_nome,
          f.tempo_estimado,
          f.valor_avancos,
          f.max_avancos,
          e.nome_empresa as estabelecimento_nome,
          e.endereco_empresa,
          e.telefone_empresa
        FROM filas f
        JOIN estabelecimentos e ON f.estabelecimento_id = e.id
        WHERE f.status = 'ativa'`,
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
    
    const userQueues = [];
    
    console.log(`📊 Total de filas ativas: ${allQueues.length}`);
    
    // Verificar cada fila para ver se o usuário está nela
    for (const queue of allQueues) {
      try {
        const clients = await redisService.getQueueClients(queue.queue_id);
        console.log(`🔍 Fila ${queue.fila_nome}: ${clients.length} clientes`);
        
        const userInQueue = clients.find(client => client.email === email);
        
        if (userInQueue) {
          console.log(`✅ Usuário encontrado na fila ${queue.fila_nome} - Posição: ${userInQueue.position}`);
          userQueues.push({
            id: queue.queue_id, // Usar 'id' em vez de 'queue_id' para compatibilidade com frontend
            queue_id: queue.queue_id,
            fila_nome: queue.fila_nome,
            tempo_estimado: queue.tempo_estimado,
            valor_avancos: queue.valor_avancos,
            max_avancos: queue.max_avancos,
            estabelecimento_nome: queue.estabelecimento_nome,
            endereco_empresa: queue.endereco_empresa,
            telefone_empresa: queue.telefone_empresa,
            posicao_atual: userInQueue.position || 1,
            total_pessoas_fila: clients.length,
            status: 'aguardando',
            data_entrada: userInQueue.timestamp || new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`Erro ao verificar fila ${queue.queue_id}:`, err);
      }
    }

    console.log(`✅ Total de filas do usuário: ${userQueues.length}`);

    res.json({
      success: true,
      data: userQueues
    });

  } catch (error) {
    console.error('❌ Erro ao obter filas ativas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Deleta conta do usuário
 * 
 * DELETE /api/users/account
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

    // Busca usuário com senha
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verifica senha
    const isPasswordValid = User.validatePassword(password, user.senha_usuario);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Remove usuário
    await User.delete(userId);

    console.log(`✅ Conta deletada: Usuário ID ${userId}`);

    res.json({
      success: true,
      message: 'Conta deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar conta do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Lista usuários (admin)
 * 
 * GET /api/users
 * Headers: { Authorization: Bearer <token> }
 * Query: { limit, offset, search }
 */
async function listUsers(req, res) {
  try {
    const { limit = 50, offset = 0, search = '' } = req.query;

    // Validação de parâmetros
    const parsedLimit = Math.min(parseInt(limit) || 50, 100); // Máximo 100 registros
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);

    const users = await User.findAll({ 
      limit: parsedLimit, 
      offset: parsedOffset, 
      search: search.trim() 
    });

    // Buscar total de registros para paginação
    const totalCount = await User.count({ search: search.trim() });

    res.json({
      success: true,
      data: users.map(user => user.toPublicObject()),
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        total: totalCount,
        hasMore: (parsedOffset + parsedLimit) < totalCount
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém usuário por ID (admin)
 * 
 * GET /api/users/:id
 * Headers: { Authorization: Bearer <token> }
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user.toPublicObject()
    });

  } catch (error) {
    console.error('❌ Erro ao obter usuário por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Atualiza usuário (admin)
 * 
 * PUT /api/users/:id
 * Headers: { Authorization: Bearer <token> }
 * Body: { nome_usuario, telefone_usuario, email_usuario, cep_usuario, endereco_usuario, numero_usuario }
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove campos que não podem ser atualizados
    delete updateData.id;
    delete updateData.cpf;
    delete updateData.senha_usuario;
    delete updateData.created_at;
    delete updateData.updated_at;

    const updatedUser = await User.update(id, updateData);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser.toPublicObject()
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Remove usuário (admin)
 * 
 * DELETE /api/users/:id
 * Headers: { Authorization: Bearer <token> }
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    await User.delete(id);

    console.log(`✅ Usuário removido: ID ${id}`);

    res.json({
      success: true,
      message: 'Usuário removido com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUserStats,
  getQueueHistory,
  getActiveQueues,
  deleteAccount,
  listUsers,
  getUserById,
  updateUser,
  deleteUser
};

