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

import express from 'express';
const router = express.Router();
import queueController from '../controllers/queueController.js';
import redisService from '../services/redis.js';
import { authenticateToken, requireUserType, requireQueueOwnership } from '../middleware/auth.js';
import { checkPlanActive, checkPlanLimits, optionalPlanCheck } from '../middleware/planCheck.js';
import { validateQueueCreation, validateJoinQueue, validatePayment, sanitizeParams } from '../middleware/validation.js';

/**
 * Middleware de validação básica
 * 
 * Verifica se o Redis está disponível antes de processar requisições
 */
const validateRedisConnection = async (req, res, next) => {
  try {
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
  checkPlanActive,
  checkPlanLimits,
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
 * @desc Avançar cliente na fila via pagamento (método legado)
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
 * @route POST /api/queues/:queueId/advance-vertical
 * @desc Avançar cliente verticalmente (muda posição principal)
 * @access Cliente
 * @params { queueId } - ID da fila
 * @body { clientId, positions, paymentData }
 */
router.post('/:queueId/advance-vertical', 
  authenticateToken,
  requireUserType('cliente'),
  sanitizeParams,
  validatePayment,
  queueController.advanceVertically
);

/**
 * @route POST /api/queues/:queueId/advance-horizontal
 * @desc Avançar cliente horizontalmente (prioridade local)
 * @access Cliente
 * @params { queueId } - ID da fila
 * @body { clientId, targetPosition, paymentData }
 */
router.post('/:queueId/advance-horizontal', 
  authenticateToken,
  requireUserType('cliente'),
  sanitizeParams,
  validatePayment,
  queueController.advanceHorizontally
);

/**
 * @route GET /api/queues/:queueId/grouped
 * @desc Obter fila com clientes agrupados (exibição bidimensional)
 * @access Público
 * @params { queueId } - ID da fila
 */
router.get('/:queueId/grouped', queueController.getQueueGrouped);

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
  checkPlanActive,
  requireQueueOwnership,
  queueController.chamarProximoCliente
);

/**
 * @route POST /api/queues/:queueId/chamar-grupo-mesa
 * @desc Chamar próximo grupo adequado para mesa específica
 * @access Estabelecimento
 * @params { queueId } - ID da fila
 * @body { capacidadeMesa }
 */
router.post('/:queueId/chamar-grupo-mesa', 
  authenticateToken,
  requireUserType('estabelecimento'),
  checkPlanActive,
  requireQueueOwnership,
  queueController.chamarGrupoPorMesa
);

/**
 * @route POST /api/queues/:queueId/add-test-client
 * @desc Adicionar cliente de teste à fila
 * @access Estabelecimento
 * @params { queueId } - ID da fila
 * @body { nome, telefone, email }
 */
router.post('/:queueId/add-test-client', 
  authenticateToken,
  requireUserType('estabelecimento'),
  requireQueueOwnership,
  sanitizeParams,
  queueController.addTestClient
);

/**
 * @route GET /api/queues/:queueId/tempo-espera
 * @desc Obter estatísticas de tempo de espera da fila
 * @access Estabelecimento
 * @params { queueId } - ID da fila
 */
router.get('/:queueId/tempo-espera', 
  authenticateToken,
  requireUserType('estabelecimento'),
  requireQueueOwnership,
  queueController.getTempoEsperaStats
);

/**
 * @route GET /api/queues/:queueId/tempo-estimado/:position
 * @desc Calcular tempo estimado para posição na fila
 * @access Público
 * @params { queueId, position } - ID da fila e posição
 * @query { atendentes } - Número de atendentes ativos (padrão: 1)
 */
router.get('/:queueId/tempo-estimado/:position', 
  sanitizeParams,
  queueController.getTempoEstimado
);

// Rotas para chamadas automáticas
router.post('/:queueId/chamada-automatica/configurar',
  authenticateToken,
  requireUserType('estabelecimento'),
  checkPlanActive,
  requireQueueOwnership,
  queueController.configurarChamadaAutomatica
);

router.get('/:queueId/chamada-automatica/status',
  authenticateToken,
  requireUserType('estabelecimento'),
  requireQueueOwnership,
  queueController.verificarChamadaAutomatica
);

router.post('/:queueId/chamada-automatica/executar',
  authenticateToken,
  requireUserType('estabelecimento'),
  requireQueueOwnership,
  queueController.executarChamadaAutomatica
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
      'POST /api/queues/:id/advance - Avançar na fila (legado)',
      'POST /api/queues/:id/advance-vertical - Avançar verticalmente',
      'POST /api/queues/:id/advance-horizontal - Avançar horizontalmente',
      'GET /api/queues/:id/grouped - Obter fila agrupada (bidimensional)',
      'GET /api/queues/:id/position/:clientId - Consultar posição',
      'GET /api/queues/:id/clients - Listar clientes',
      'DELETE /api/queues/:id/clients/:clientId - Remover cliente',
      'PUT /api/queues/:id/status - Atualizar status',
      'DELETE /api/queues/:id - Encerrar fila',
      'GET /api/queues/:id/stats - Estatísticas'
    ]
  });
});

export default router;

