/**
 * Rotas REST para Sistema de Filas Flig
 * 
 * Este módulo define todas as rotas HTTP para o sistema de filas virtuais,
 * conectando o frontend com os controllers correspondentes.
 * 
 * Estrutura das rotas:
 * - POST /api/queues - Criar nova fila
 * - GET /api/queues/establishment/:id - Listar filas de estabelecimento
 * - GET /api/queues/:id - Buscar fila por ID
 * - POST /api/queues/:id/join - Entrar na fila
 * - POST /api/queues/:id/advance - Avançar na fila (pagamento)
 * - GET /api/queues/:id/position/:clientId - Consultar posição
 * - GET /api/queues/:id/clients - Listar clientes da fila
 * - DELETE /api/queues/:id/clients/:clientId - Remover cliente
 * - PUT /api/queues/:id/status - Atualizar status da fila
 * - DELETE /api/queues/:id - Encerrar fila
 * - GET /api/queues/:id/stats - Estatísticas da fila
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { authenticateToken, requireUserType, requireQueueOwnership } = require('../middleware/auth');
const { validateQueueCreation, validateJoinQueue, validatePayment, sanitizeParams } = require('../middleware/validation');

/**
 * Middleware de validação básica
 * 
 * Verifica se o Redis está disponível antes de processar requisições
 */
const validateRedisConnection = async (req, res, next) => {
  try {
    const redisService = require('../services/redis');
    const isAvailable = await redisService.isRedisAvailable();
    
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        message: 'Serviço de filas temporariamente indisponível'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar conexão Redis:', error);
    res.status(503).json({
      success: false,
      message: 'Serviço de filas temporariamente indisponível'
    });
  }
};

/**
 * Middleware de log de requisições
 * 
 * Registra todas as requisições para debugging e monitoramento
 */
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 [${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

// Aplica middlewares em todas as rotas
router.use(logRequest);
router.use(validateRedisConnection);

/**
 * @route POST /api/queues
 * @desc Criar nova fila para estabelecimento
 * @access Estabelecimento
 * @body { nome, descricao, max_avancos, valor_avancos, tempo_estimado }
 */
router.post('/', 
  authenticateToken,
  requireUserType('estabelecimento'),
  validateQueueCreation,
  queueController.createQueue
);

/**
 * @route GET /api/queues/establishment/:estabelecimentoId
 * @desc Listar todas as filas de um estabelecimento
 * @access Estabelecimento
 * @params { estabelecimentoId } - ID do estabelecimento
 */
router.get('/establishment/:estabelecimentoId', 
  authenticateToken,
  requireUserType('estabelecimento'),
  sanitizeParams,
  queueController.getEstablishmentQueues
);

/**
 * @route GET /api/queues/:queueId
 * @desc Buscar fila específica por ID
 * @access Público
 * @params { queueId } - ID da fila
 */
router.get('/:queueId', queueController.getQueueById);

/**
 * @route POST /api/queues/:queueId/join
 * @desc Adicionar cliente à fila
 * @access Cliente
 * @params { queueId } - ID da fila
 * @body { nome, telefone, email }
 */
router.post('/:queueId/join', 
  authenticateToken,
  requireUserType('cliente'),
  sanitizeParams,
  validateJoinQueue,
  queueController.joinQueue
);

/**
 * @route POST /api/queues/:queueId/advance
 * @desc Avançar cliente na fila via pagamento
 * @access Cliente
 * @params { queueId } - ID da fila
 * @body { clientId, positions, paymentData }
 */
router.post('/:queueId/advance', 
  authenticateToken,
  requireUserType('cliente'),
  sanitizeParams,
  validatePayment,
  queueController.advanceInQueue
);

/**
 * @route DELETE /api/queues/:queueId/leave
 * @desc Sair da fila
 * @access Cliente
 * @params { queueId } - ID da fila
 */
router.delete('/:queueId/leave', 
  authenticateToken,
  requireUserType('cliente'),
  sanitizeParams,
  queueController.leaveQueue
);

/**
 * @route GET /api/queues/:queueId/position/:clientId
 * @desc Consultar posição do cliente na fila
 * @access Cliente
 * @params { queueId, clientId } - IDs da fila e cliente
 */
router.get('/:queueId/position/:clientId', queueController.getClientPosition);

/**
 * @route GET /api/queues/:queueId/clients
 * @desc Listar clientes da fila
 * @access Estabelecimento/Cliente
 * @params { queueId } - ID da fila
 * @query { isEstablishment } - Se é visualização do estabelecimento
 */
router.get('/:queueId/clients', queueController.getQueueClients);

/**
 * @route DELETE /api/queues/:queueId/clients/:clientId
 * @desc Remover cliente da fila
 * @access Estabelecimento/Cliente
 * @params { queueId, clientId } - IDs da fila e cliente
 */
router.delete('/:queueId/clients/:clientId', queueController.removeClientFromQueue);

/**
 * @route PUT /api/queues/:queueId/status
 * @desc Atualizar status da fila (ativa/pausada/encerrada)
 * @access Estabelecimento
 * @params { queueId } - ID da fila
 * @body { status } - Novo status da fila
 */
router.put('/:queueId/status', queueController.updateQueueStatus);

/**
 * @route DELETE /api/queues/:queueId
 * @desc Encerrar fila e limpar dados do Redis
 * @access Estabelecimento
 * @params { queueId } - ID da fila
 */
router.delete('/:queueId', queueController.closeQueue);

/**
 * @route GET /api/queues/:queueId/stats
 * @desc Obter estatísticas da fila
 * @access Estabelecimento
 * @params { queueId } - ID da fila
 */
router.get('/:queueId/stats', queueController.getQueueStats);

/**
 * @route POST /api/queues/:queueId/chamar-proximo
 * @desc Chamar próximo cliente da fila
 * @access Estabelecimento
 * @params { queueId } - ID da fila
 */
router.post('/:queueId/chamar-proximo', 
  authenticateToken,
  requireUserType('estabelecimento'),
  requireQueueOwnership,
  queueController.chamarProximoCliente
);

/**
 * Middleware de tratamento de erros específico para rotas de filas
 */
router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de filas:', error);
  
  // Erro de validação
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.errors
    });
  }
  
  // Erro de conexão Redis
  if (error.message.includes('Redis')) {
    return res.status(503).json({
      success: false,
      message: 'Serviço de filas temporariamente indisponível'
    });
  }
  
  // Erro genérico
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

/**
 * Middleware para rotas não encontradas
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'POST /api/queues - Criar fila',
      'GET /api/queues/establishment/:id - Listar filas do estabelecimento',
      'GET /api/queues/:id - Buscar fila',
      'POST /api/queues/:id/join - Entrar na fila',
      'POST /api/queues/:id/advance - Avançar na fila',
      'GET /api/queues/:id/position/:clientId - Consultar posição',
      'GET /api/queues/:id/clients - Listar clientes',
      'DELETE /api/queues/:id/clients/:clientId - Remover cliente',
      'PUT /api/queues/:id/status - Atualizar status',
      'DELETE /api/queues/:id - Encerrar fila',
      'GET /api/queues/:id/stats - Estatísticas'
    ]
  });
});

module.exports = router;

