/**
 * Controller de Filas para Sistema Flig
 * 
 * Este controller gerencia todas as operações relacionadas às filas virtuais,
 * incluindo criação, entrada de clientes, avanço de posições, consultas e encerramento.
 * 
 * Funcionalidades principais:
 * - Criar filas para estabelecimentos
 * - Permitir entrada de clientes nas filas
 * - Processar avanço de posições via pagamento
 * - Consultar posição e status da fila
 * - Gerenciar filas (pausar, encerrar)
 * - Obter relatórios e estatísticas
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const Queue = require('../models/Queue');
const paymentService = require('../services/payment');
const redisService = require('../services/redis');
const cryptoUtils = require('../utils/crypto');
const uuidUtils = require('../utils/uuid');

/**
 * Cria uma nova fila para um estabelecimento
 * 
 * POST /api/queues
 * Body: { nome, estabelecimento_id, descricao, max_avancos, valor_avancos, tempo_estimado }
 */
async function createQueue(req, res) {
  try {
    const {
      nome,
      estabelecimento_id,
      descricao,
      max_avancos = 8,
      valor_avancos = 2.00,
      tempo_estimado = 5
    } = req.body;

    // Validações obrigatórias
    if (!nome || !estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'Nome da fila e ID do estabelecimento são obrigatórios'
      });
    }

    // Valida número máximo de avanços
    if (max_avancos > 8) {
      return res.status(400).json({
        success: false,
        message: 'Máximo de 8 avanços permitidos por pagamento'
      });
    }

    // Cria a fila
    const queue = await Queue.create({
      nome,
      estabelecimento_id,
      descricao,
      max_avancos,
      valor_avancos,
      tempo_estimado
    });

    console.log(`✅ Fila criada: ${queue.nome} (ID: ${queue.id})`);

    res.status(201).json({
      success: true,
      message: 'Fila criada com sucesso',
      data: {
        queue: {
          id: queue.id,
          nome: queue.nome,
          estabelecimento_id: queue.estabelecimento_id,
          descricao: queue.descricao,
          status: queue.status,
          max_avancos: queue.max_avancos,
          valor_avancos: queue.valor_avancos,
          tempo_estimado: queue.tempo_estimado,
          created_at: queue.created_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar fila:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Lista filas de um estabelecimento
 * 
 * GET /api/queues/establishment/:estabelecimentoId
 */
async function getEstablishmentQueues(req, res) {
  try {
    const { estabelecimentoId } = req.params;

    if (!estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento é obrigatório'
      });
    }

    const queues = await Queue.findByEstabelecimento(estabelecimentoId);

    // Adiciona estatísticas de cada fila
    const queuesWithStats = await Promise.all(
      queues.map(async (queue) => {
        const stats = await queue.getStats();
        return {
          ...queue,
          stats
        };
      })
    );

    res.json({
      success: true,
      data: queuesWithStats
    });

  } catch (error) {
    console.error('❌ Erro ao buscar filas do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Busca fila por ID
 * 
 * GET /api/queues/:queueId
 */
async function getQueueById(req, res) {
  try {
    const { queueId } = req.params;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila é obrigatório'
      });
    }

    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    const stats = await queue.getStats();

    res.json({
      success: true,
      data: {
        ...queue,
        stats
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar fila:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Adiciona cliente à fila
 * 
 * POST /api/queues/:queueId/join
 * Body: { nome, telefone, email }
 */
async function joinQueue(req, res) {
  try {
    const { queueId } = req.params;
    const { nome, telefone, email } = req.body;

    // Validações obrigatórias
    if (!nome || !telefone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome, telefone e email são obrigatórios'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Verifica se a fila está ativa
    if (queue.status !== 'ativa') {
      return res.status(400).json({
        success: false,
        message: 'Fila não está ativa'
      });
    }

    // Adiciona cliente à fila
    const result = await queue.addClient({
      nome,
      telefone,
      email
    });

    console.log(`✅ Cliente ${nome} entrou na fila ${queue.nome}`);

    res.status(201).json({
      success: true,
      message: 'Cliente adicionado à fila com sucesso',
      data: {
        clientId: result.clientId,
        position: result.position,
        estimatedTime: result.estimatedTime,
        queueName: queue.nome
      }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar cliente à fila:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

/**
 * Avança cliente na fila via pagamento
 * 
 * POST /api/queues/:queueId/advance
 * Body: { clientId, positions, paymentData }
 */
async function advanceInQueue(req, res) {
  try {
    const { queueId } = req.params;
    const { clientId, positions, paymentData } = req.body;

    // Validações obrigatórias
    if (!clientId || !positions || !paymentData) {
      return res.status(400).json({
        success: false,
        message: 'ID do cliente, número de posições e dados de pagamento são obrigatórios'
      });
    }

    // Valida número de posições
    if (positions < 1 || positions > 8) {
      return res.status(400).json({
        success: false,
        message: 'Número de posições deve estar entre 1 e 8'
      });
    }

    // Busca clientes da fila para verificar se há mais de uma pessoa
    const clients = await redisService.getQueueClients(queueId);
    if (!Array.isArray(clients)) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar clientes da fila'
      });
    }

    // Verifica se há mais de uma pessoa na fila
    if (clients.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível avançar posições quando há apenas uma pessoa na fila'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Verifica se a fila está ativa
    if (queue.status !== 'ativa') {
      return res.status(400).json({
        success: false,
        message: 'Fila não está ativa'
      });
    }

    // Calcula valor do avanço
    const amount = paymentService.calculateAdvancePrice(positions, queue.valor_avancos);

    // Processa pagamento simulado
    const paymentResult = await paymentService.processPayment({
      clientId,
      queueId,
      positions,
      amount,
      ...paymentData
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.message,
        error: paymentResult.error
      });
    }

    // Avança cliente na fila
    const advanceResult = await queue.advanceClient(clientId, positions);

    console.log(`✅ Cliente ${clientId} avançou ${positions} posições na fila ${queue.nome}`);

    res.json({
      success: true,
      message: 'Avanço processado com sucesso',
      data: {
        transactionId: paymentResult.transactionId,
        oldPosition: advanceResult.oldPosition,
        newPosition: advanceResult.newPosition,
        positionsAdvanced: advanceResult.positionsAdvanced,
        estimatedTime: advanceResult.estimatedTime,
        amount: amount
      }
    });

  } catch (error) {
    console.error('❌ Erro ao avançar cliente na fila:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

/**
 * Remove cliente da fila
 * 
 * DELETE /api/queues/:queueId/leave
 */
async function leaveQueue(req, res) {
  try {
    const { queueId } = req.params;
    const { userId, email } = req.user;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila é obrigatório'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Verifica se a fila está ativa
    if (queue.status !== 'ativa') {
      return res.status(400).json({
        success: false,
        message: 'Fila não está ativa'
      });
    }

    // Busca clientes da fila
    const clients = await redisService.getQueueClients(queueId);
    if (!Array.isArray(clients)) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar clientes da fila'
      });
    }

    // Encontra o cliente na fila
    const clientIndex = clients.findIndex(client => client.email === email);
    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Você não está nesta fila'
      });
    }

    const client = clients[clientIndex];
    const position = clientIndex + 1;

    // Remove o cliente da fila usando a função do redisService
    const result = await redisService.removeClientFromQueue(queueId, client);
    console.log(`✅ Cliente removido: ${result}`);

    console.log(`✅ Cliente ${email} saiu da fila ${queue.nome} (posição ${position})`);

    res.json({
      success: true,
      message: 'Você saiu da fila com sucesso',
      data: {
        queueName: queue.nome,
        previousPosition: position,
        totalClients: clients.length - 1
      }
    });

  } catch (error) {
    console.error('❌ Erro ao sair da fila:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

/**
 * Consulta posição do cliente na fila
 * 
 * GET /api/queues/:queueId/position/:clientId
 */
async function getClientPosition(req, res) {
  try {
    const { queueId, clientId } = req.params;

    if (!queueId || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila e ID do cliente são obrigatórios'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Obtém posição do cliente
    const position = await queue.getClientPosition(clientId);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado na fila'
      });
    }

    res.json({
      success: true,
      data: {
        clientId: clientId,
        position: position.position,
        estimatedTime: position.estimatedTime,
        totalClients: position.totalClients,
        queueName: queue.nome
      }
    });

  } catch (error) {
    console.error('❌ Erro ao consultar posição do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Lista clientes da fila (para estabelecimento)
 * 
 * GET /api/queues/:queueId/clients
 */
async function getQueueClients(req, res) {
  try {
    const { queueId } = req.params;
    const { isEstablishment } = req.query;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila é obrigatório'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Obtém clientes da fila
    const clients = await queue.getClients(isEstablishment === 'true');

    res.json({
      success: true,
      data: {
        queueId: queueId,
        queueName: queue.nome,
        totalClients: clients.length,
        clients: clients
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar clientes da fila:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Remove cliente da fila
 * 
 * DELETE /api/queues/:queueId/clients/:clientId
 */
async function removeClientFromQueue(req, res) {
  try {
    const { queueId, clientId } = req.params;

    if (!queueId || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila e ID do cliente são obrigatórios'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Remove cliente da fila
    const removed = await queue.removeClient(clientId);
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado na fila'
      });
    }

    console.log(`✅ Cliente ${clientId} removido da fila ${queue.nome}`);

    res.json({
      success: true,
      message: 'Cliente removido da fila com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover cliente da fila:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Atualiza status da fila
 * 
 * PUT /api/queues/:queueId/status
 * Body: { status }
 */
async function updateQueueStatus(req, res) {
  try {
    const { queueId } = req.params;
    const { status } = req.body;

    if (!queueId || !status) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila e status são obrigatórios'
      });
    }

    // Valida status
    const validStatuses = ['ativa', 'pausada', 'encerrada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Use: ativa, pausada ou encerrada'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Atualiza status
    await queue.updateStatus(status);

    console.log(`✅ Status da fila ${queue.nome} atualizado para: ${status}`);

    res.json({
      success: true,
      message: 'Status da fila atualizado com sucesso',
      data: {
        queueId: queueId,
        queueName: queue.nome,
        status: status
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar status da fila:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Encerra fila e limpa dados do Redis
 * 
 * DELETE /api/queues/:queueId
 */
async function closeQueue(req, res) {
  try {
    const { queueId } = req.params;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila é obrigatório'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Encerra a fila
    await queue.close();

    console.log(`✅ Fila ${queue.nome} encerrada`);

    res.json({
      success: true,
      message: 'Fila encerrada com sucesso',
      data: {
        queueId: queueId,
        queueName: queue.nome
      }
    });

  } catch (error) {
    console.error('❌ Erro ao encerrar fila:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém estatísticas da fila
 * 
 * GET /api/queues/:queueId/stats
 */
async function getQueueStats(req, res) {
  try {
    const { queueId } = req.params;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'ID da fila é obrigatório'
      });
    }

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Obtém estatísticas da fila
    const queueStats = await queue.getStats();
    
    // Obtém estatísticas de pagamento
    const paymentStats = await paymentService.getQueuePaymentStats(queueId);

    res.json({
      success: true,
      data: {
        queue: {
          id: queue.id,
          nome: queue.nome,
          estabelecimento_id: queue.estabelecimento_id,
          status: queue.status,
          max_avancos: queue.max_avancos,
          valor_avancos: queue.valor_avancos,
          tempo_estimado: queue.tempo_estimado
        },
        stats: queueStats,
        paymentStats: paymentStats
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas da fila:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Chama o próximo cliente da fila
 * 
 * POST /api/queues/:queueId/chamar-proximo
 */
async function chamarProximoCliente(req, res) {
  try {
    const { queueId } = req.params;
    
    // Busca a fila no banco
    const fila = await Queue.findById(queueId);
    if (!fila) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }
    
    // Verifica se a fila está ativa
    if (fila.status !== 'ativa') {
      return res.status(400).json({
        success: false,
        message: 'Fila não está ativa'
      });
    }
    
    // Busca o próximo cliente no Redis
    const proximoCliente = await redisService.getNextClient(queueId);
    
    if (!proximoCliente) {
      return res.status(404).json({
        success: false,
        message: 'Não há clientes na fila'
      });
    }
    
    // Remove o cliente da fila (chamado)
    const removed = await redisService.removeClientFromQueue(queueId, proximoCliente);
    
    if (!removed) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover cliente da fila'
      });
    }
    
    console.log(`✅ Cliente ${proximoCliente.nome} chamado da fila ${queueId}`);
    
    res.json({
      success: true,
      message: 'Cliente chamado com sucesso',
      data: proximoCliente
    });
    
  } catch (error) {
    console.error('❌ Erro ao chamar próximo cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = {
  createQueue,
  getEstablishmentQueues,
  getQueueById,
  joinQueue,
  advanceInQueue,
  leaveQueue,
  getClientPosition,
  getQueueClients,
  removeClientFromQueue,
  updateQueueStatus,
  closeQueue,
  getQueueStats,
  chamarProximoCliente
};

