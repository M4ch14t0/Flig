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

import Queue from '../models/Queue.js';
import paymentService from '../services/payment.js';
import connection from '../config/db.js';
import { pool } from '../config/database.js';
import redisService from '../services/redis.js';
import TempoEsperaService from '../services/tempoEsperaService.js';
import AutoCallService from '../services/autoCallService.js';
import { encryptClientData, decryptClientData } from '../utils/crypto.js';
import uuidUtils from '../utils/uuid.js';

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
      tempo_estimado = 5,
      // Campos do frontend
      tipo_fila,
      limitar_fila,
      max_integrantes,
      abrir_agora,
      horario_abertura,
      chamada_automatica,
      intervalo_chamada
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
    console.log('🔍 Criando fila com dados:', {
      nome,
      estabelecimento_id,
      descricao,
      max_avancos,
      valor_avancos,
      tempo_estimado
    });
    
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
    const { 
      nome, 
      telefone, 
      email, 
      // Novos campos para grupos
      groupMembers = [],
      isGroup = false
    } = req.body;

    // Validações obrigatórias
    if (!nome || !telefone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome, telefone e email são obrigatórios'
      });
    }

    // Validações para grupos
    if (isGroup && (!groupMembers || groupMembers.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Grupo deve ter pelo menos um membro além do líder'
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

    let result;
    
    if (isGroup) {
      // Adicionar grupo à fila
      result = await queue.addGroup({
        leader: { nome, telefone, email },
        members: groupMembers
      });
    } else {
      // Adicionar cliente individual à fila
      result = await queue.addClient({
        nome,
        telefone,
        email
      });
    }

    // Registrar tempo de entrada para cálculo de espera
    try {
      await TempoEsperaService.registrarEntrada(result.clientId, queueId, email);
    } catch (tempoError) {
      console.warn('⚠️ Erro ao registrar tempo de entrada:', tempoError);
      // Não falhar a operação por causa do tempo de entrada
    }

    console.log(`✅ ${isGroup ? 'Grupo' : 'Cliente'} ${nome} entrou na fila ${queue.nome}`);

    res.status(201).json({
      success: true,
      message: isGroup ? 'Grupo adicionado à fila com sucesso' : 'Cliente adicionado à fila com sucesso',
      data: {
        clientId: result.clientId,
        groupId: result.groupId,
        position: result.position,
        estimatedTime: result.estimatedTime,
        queueName: queue.nome,
        groupSize: result.groupSize,
        isGroup: isGroup
      }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar à fila:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

/**
 * Avança cliente na fila via pagamento (método legado)
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

    // Busca o cliente na fila pelo email do usuário (req.user.email)
    // Já que o clientId enviado é o ID do banco, precisamos encontrar o UUID na fila
    const clientInQueue = clients.find(client => {
      // Verifica se o cliente na fila é o mesmo que está fazendo a requisição
      // usando o email ou comparando com o clientId
      return String(client.id).includes(String(clientId)) || 
             (client.email && client.email === req.user?.email);
    });

    if (!clientInQueue) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado na fila'
      });
    }

    console.log(`🔍 Cliente encontrado na fila: ID ${clientInQueue.id}, Nome: ${clientInQueue.nome}`);

    // Avança cliente na fila usando a lógica bidimensional
    const advanceResult = await queue.advanceClientVertically(clientInQueue.id, positions);

    console.log(`✅ Cliente ${clientInQueue.nome} avançou ${positions} posições na fila ${queue.nome}`);

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

    // Marcar como abandonou no histórico
    try {
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE historico_clientes_filas 
           SET status = 'abandonou', data_saida = NOW() 
           WHERE queue_id = ? AND email_cliente = ? AND status = 'aguardando'`,
          [queueId, email],
          (err, results) => {
            if (err) reject(err);
            else {
              console.log(`📝 Cliente ${email} marcado como abandonou no histórico`);
              resolve(results);
            }
          }
        );
      });
    } catch (histErr) {
      console.warn('⚠️ Erro ao atualizar histórico:', histErr);
    }

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
    
    // Usar nova função com movimento automático
    const proximoCliente = await redisService.callNextClientWithAutoMove(queueId);
    
    if (!proximoCliente) {
      return res.status(404).json({
        success: false,
        message: 'Não há clientes na fila'
      });
    }
    
    // Marcar cliente como "chamado" no histórico (aguardando comparecimento)
    try {
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE historico_clientes_filas 
           SET status = 'chamado', data_saida = NOW() 
           WHERE queue_id = ? AND email_cliente = ? AND status = 'aguardando'`,
          [queueId, proximoCliente.email],
          (err, results) => {
            if (err) reject(err);
            else {
              console.log(`📝 Cliente ${proximoCliente.email} marcado como chamado no histórico`);
              resolve(results);
            }
          }
        );
      });
    } catch (histErr) {
      console.warn('⚠️ Erro ao atualizar histórico:', histErr);
    }

    // Registrar tempo de atendimento e calcular tempo de espera
    try {
      const clientId = proximoCliente.id || proximoCliente.clientId || `client-${Date.now()}`;
      const tempoEsperaData = await TempoEsperaService.registrarAtendimento(
        clientId,
        queueId,
        proximoCliente.email
      );
      
      console.log(`⏰ Cliente ${proximoCliente.email} foi atendido após ${tempoEsperaData.tempoEsperaMinutos} minutos de espera`);
    } catch (tempoError) {
      console.error('❌ Erro ao registrar tempo de atendimento:', tempoError.message);
      console.error('Stack:', tempoError.stack);
      // Não falhar a operação por causa do tempo de espera
    }

    // Configurar timeout para marcar como abandonou se não comparecer
    const timeoutMinutes = 5; // 5 minutos para comparecer
    setTimeout(async () => {
      try {
        // Verificar se o cliente ainda está como "chamado" (não compareceu)
        await new Promise((resolve, reject) => {
          connection.query(
            `SELECT id FROM historico_clientes_filas 
             WHERE queue_id = ? AND email_cliente = ? AND status = 'chamado'`,
            [queueId, proximoCliente.email],
            (err, rows) => {
              if (err) reject(err);
              else {
                if (rows.length > 0) {
                  // Cliente não compareceu, marcar como abandonou
                  connection.query(
                    `UPDATE historico_clientes_filas 
                     SET status = 'abandonou' 
                     WHERE queue_id = ? AND email_cliente = ? AND status = 'chamado'`,
                    [queueId, proximoCliente.email],
                    (updateErr, updateResult) => {
                      if (updateErr) reject(updateErr);
                      else resolve(updateResult);
                    }
                  );
                } else {
                  resolve();
                }
              }
            }
          );
        });
        console.log(`⏰ Cliente ${proximoCliente.email} marcado como abandonou (não compareceu em ${timeoutMinutes}min)`);
      } catch (timeoutErr) {
        console.error('❌ Erro no timeout de abandono:', timeoutErr);
      }
    }, timeoutMinutes * 60 * 1000); // Converter minutos para milissegundos
    
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

/**
 * Chama próximo grupo adequado para mesa específica
 * 
 * POST /api/queues/:queueId/chamar-grupo-mesa
 * Body: { capacidadeMesa }
 */
async function chamarGrupoPorMesa(req, res) {
  try {
    const { queueId } = req.params;
    const { capacidadeMesa } = req.body;
    
    if (!capacidadeMesa || capacidadeMesa < 1) {
      return res.status(400).json({
        success: false,
        message: 'Capacidade da mesa deve ser informada e maior que 0'
      });
    }
    
    // Validar capacidades suportadas
    const capacidadesSuportadas = [2, 4, 6, 8];
    if (!capacidadesSuportadas.includes(capacidadeMesa)) {
      return res.status(400).json({
        success: false,
        message: `Capacidade de mesa não suportada. Use: ${capacidadesSuportadas.join(', ')} lugares`
      });
    }
    
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
    
    // Buscar próximo grupo adequado para a mesa com intervalo exclusivo
    const proximoGrupo = await redisService.getNextGroupForTable(queueId, capacidadeMesa);
    
    if (!proximoGrupo) {
      // Definir intervalo baseado na capacidade
      let intervalo;
      switch (capacidadeMesa) {
        case 2: intervalo = "1-2 pessoas"; break;
        case 4: intervalo = "3-4 pessoas"; break;
        case 6: intervalo = "5-6 pessoas"; break;
        case 8: intervalo = "7-8 pessoas"; break;
        default: intervalo = "adequado";
      }
      
      return res.status(404).json({
        success: false,
        message: `Não há grupos adequados para mesa de ${capacidadeMesa} lugares (intervalo: ${intervalo})`
      });
    }
    
    // Chamar o grupo com movimento automático
    const grupoChamado = await redisService.callNextClientWithAutoMove(queueId);
    
    if (!grupoChamado) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao chamar grupo da fila'
      });
    }
    
    // Marcar grupo como "chamado" no histórico
    try {
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE historico_clientes_filas 
           SET status = 'chamado', data_saida = NOW() 
           WHERE queue_id = ? AND email_cliente = ? AND status = 'aguardando'`,
          [queueId, grupoChamado.email],
          (err, results) => {
            if (err) reject(err);
            else {
              console.log(`📝 Grupo ${grupoChamado.email} marcado como chamado no histórico`);
              resolve(results);
            }
          }
        );
      });
    } catch (histErr) {
      console.warn('⚠️ Erro ao atualizar histórico:', histErr);
    }
    
    // Definir intervalo baseado na capacidade
    let intervalo;
    switch (capacidadeMesa) {
      case 2: intervalo = "1-2 pessoas"; break;
      case 4: intervalo = "3-4 pessoas"; break;
      case 6: intervalo = "5-6 pessoas"; break;
      case 8: intervalo = "7-8 pessoas"; break;
      default: intervalo = "adequado";
    }
    
    console.log(`✅ Grupo ${grupoChamado.nome} (${grupoChamado.groupSize} pessoas) chamado para mesa de ${capacidadeMesa} lugares (intervalo: ${intervalo})`);
    
    res.json({
      success: true,
      message: 'Grupo chamado com sucesso',
      data: {
        ...grupoChamado,
        mesaCapacidade: capacidadeMesa,
        intervaloMesa: intervalo,
        descricao: `Mesa de ${capacidadeMesa} lugares para grupos de ${intervalo}`
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao chamar grupo por mesa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Adiciona cliente de teste à fila (para estabelecimento)
 * 
 * POST /api/queues/:queueId/add-test-client
 * Body: { nome, telefone, email }
 */
async function addTestClient(req, res) {
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

    // Criar registro no histórico
    try {
      const clientId = result.clientId || `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const posicaoInicial = result.position || 1;
      
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO historico_clientes_filas 
           (client_id, queue_id, email_cliente, nome_cliente, telefone_cliente, posicao_inicial, status, data_entrada) 
           VALUES (?, ?, ?, ?, ?, ?, 'aguardando', NOW())`,
          [clientId, queueId, email, nome, telefone, posicaoInicial],
          (err, results) => {
            if (err) reject(err);
            else {
              console.log(`📝 Cliente ${email} adicionado ao histórico (ID: ${clientId}, Posição: ${posicaoInicial})`);
              resolve(results);
            }
          }
        );
      });
    } catch (histErr) {
      console.warn('⚠️ Erro ao adicionar ao histórico:', histErr);
    }

    console.log(`✅ Cliente de teste ${nome} adicionado à fila ${queue.nome}`);

    res.status(201).json({
      success: true,
      message: 'Cliente de teste adicionado à fila com sucesso',
      data: {
        clientId: result.clientId,
        position: result.position,
        estimatedTime: result.estimatedTime,
        queueName: queue.nome
      }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar cliente de teste à fila:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém estatísticas de tempo de espera de uma fila
 * 
 * GET /api/queues/:queueId/tempo-espera
 */
async function getTempoEsperaStats(req, res) {
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
    
    // Obter estatísticas de tempo de espera
    const stats = await TempoEsperaService.obterEstatisticasTempo(queueId);
    
    // Buscar intervalo médio entre chamadas
    const [intervaloRows] = await pool.execute(
      `SELECT tempo_medio_atendimento, total_atendimentos_calculados FROM filas WHERE id = ?`,
      [queueId]
    );
    
    const intervaloMedio = intervaloRows.length > 0 ? parseFloat(intervaloRows[0].tempo_medio_atendimento) || 0 : 0;
    const totalAtendimentosCalc = intervaloRows.length > 0 ? parseInt(intervaloRows[0].total_atendimentos_calculados) || 0 : 0;
    
    res.json({
      success: true,
      data: {
        queueId,
        queueName: fila.nome,
        tempoEspera: stats,
        intervalo: {
          medio: intervaloMedio.toFixed(2),
          totalCalculados: totalAtendimentosCalc,
          descricao: 'Tempo médio entre chamadas (intervalo de atendimento)'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de tempo de espera:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Calcula tempo estimado para um cliente na fila
 * 
 * GET /api/queues/:queueId/tempo-estimado/:position
 */
async function getTempoEstimado(req, res) {
  try {
    const { queueId, position } = req.params;
    const { atendentes = 1 } = req.query;
    
    const posicaoAtual = parseInt(position);
    const atendentesAtivos = parseInt(atendentes);
    
    if (isNaN(posicaoAtual) || posicaoAtual < 1) {
      return res.status(400).json({
        success: false,
        message: 'Posição inválida'
      });
    }
    
    // Calcular tempo estimado
    const estimativa = await TempoEsperaService.calcularTempoEstimado(
      queueId, 
      posicaoAtual, 
      atendentesAtivos
    );
    
    res.json({
      success: true,
      data: {
        queueId,
        posicaoAtual,
        atendentesAtivos,
        estimativa
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao calcular tempo estimado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Configurar chamada automática para uma fila
async function configurarChamadaAutomatica(req, res) {
  try {
    const { queueId } = req.params;
    const { ativar, intervalo = 5 } = req.body;
    
    const resultado = await AutoCallService.configurarChamadaAutomatica(queueId, ativar, intervalo);
    
    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro ao configurar chamada automática:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
}

// Verificar status da chamada automática
async function verificarChamadaAutomatica(req, res) {
  try {
    const { queueId } = req.params;
    
    const status = await AutoCallService.verificarChamadaAutomatica(queueId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Erro ao verificar chamada automática:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
}

// Executar chamada automática manualmente
async function executarChamadaAutomatica(req, res) {
  try {
    const { queueId } = req.params;
    
    const resultado = await AutoCallService.executarChamadaAutomatica(queueId);
    
    res.json({
      success: resultado.sucesso,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro ao executar chamada automática:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
}

/**
 * Avança cliente verticalmente (muda posição principal)
 * 
 * POST /api/queues/:queueId/advance-vertical
 * Body: { clientId, positions, paymentData }
 */
async function advanceVertically(req, res) {
  try {
    const { queueId } = req.params;
    const { clientId, positions } = req.body;

    // Validações obrigatórias
    if (!clientId || !positions) {
      return res.status(400).json({
        success: false,
        message: 'ID do cliente e número de posições são obrigatórios'
      });
    }

    // Valida número de posições
    if (positions < 1 || positions > 8) {
      return res.status(400).json({
        success: false,
        message: 'Número de posições deve estar entre 1 e 8'
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

    // Avançar cliente verticalmente (sem processamento de pagamento)
    const result = await queue.advanceClientVertically(clientId, positions);

    console.log(`✅ Cliente ${clientId} avançou verticalmente ${positions} posições`);

    res.json({
      success: true,
      message: 'Cliente avançado verticalmente com sucesso',
      data: {
        oldPosition: result.oldPosition,
        newPosition: result.newPosition,
        positionsAdvanced: result.positionsAdvanced,
        estimatedTime: result.estimatedTime
      }
    });

  } catch (error) {
    console.error('❌ Erro ao avançar cliente verticalmente:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

/**
 * Avança cliente horizontalmente (prioridade local)
 * 
 * POST /api/queues/:queueId/advance-horizontal
 * Body: { clientId, targetPosition, paymentData }
 */
async function advanceHorizontally(req, res) {
  try {
    const { queueId } = req.params;
    const { clientId, targetPosition, paymentData } = req.body;

    // Validações obrigatórias
    if (!clientId || !targetPosition || !paymentData) {
      return res.status(400).json({
        success: false,
        message: 'ID do cliente, posição alvo e dados de pagamento são obrigatórios'
      });
    }

    // Valida posição alvo
    if (targetPosition < 4) {
      return res.status(400).json({
        success: false,
        message: 'Top 3 posições são protegidas contra avanço'
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

    // Processar pagamento (lógica existente)
    const paymentResult = await paymentService.processPayment(paymentData);
    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Falha no processamento do pagamento'
      });
    }

    // Avançar cliente horizontalmente
    const result = await queue.advanceClientHorizontally(clientId, targetPosition);

    console.log(`✅ Cliente ${clientId} avançou horizontalmente para posição ${targetPosition}`);

    res.json({
      success: true,
      message: 'Cliente avançado horizontalmente com sucesso',
      data: {
        oldPosition: result.oldPosition,
        newPosition: result.newPosition,
        subPosition: result.subPosition,
        estimatedTime: result.estimatedTime,
        paymentId: paymentResult.paymentId
      }
    });

  } catch (error) {
    console.error('❌ Erro ao avançar cliente horizontalmente:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

/**
 * Obtém fila com clientes agrupados (exibição bidimensional)
 * 
 * GET /api/queues/:queueId/grouped
 */
async function getQueueGrouped(req, res) {
  try {
    const { queueId } = req.params;

    // Busca a fila
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Fila não encontrada'
      });
    }

    // Obter clientes agrupados
    const groupedClients = await queue.getClientsGrouped();

    res.json({
      success: true,
      data: {
        queueId: queue.id,
        queueName: queue.nome,
        status: queue.status,
        groupedClients: groupedClients
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter fila agrupada:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

export {
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
  chamarProximoCliente,
  chamarGrupoPorMesa,
  addTestClient,
  getTempoEsperaStats,
  getTempoEstimado,
  configurarChamadaAutomatica,
  verificarChamadaAutomatica,
  executarChamadaAutomatica,
  // Novos endpoints para filas bidimensionais
  advanceVertically,
  advanceHorizontally,
  getQueueGrouped
};

export default {
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
  chamarProximoCliente,
  chamarGrupoPorMesa,
  addTestClient,
  getTempoEsperaStats,
  getTempoEstimado,
  configurarChamadaAutomatica,
  verificarChamadaAutomatica,
  executarChamadaAutomatica,
  // Novos endpoints para filas bidimensionais
  advanceVertically,
  advanceHorizontally,
  getQueueGrouped
};

