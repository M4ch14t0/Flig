/**
 * Rotas de Estabelecimentos para Sistema Flig
 * 
 * Define todas as rotas relacionadas aos estabelecimentos:
 * - Perfil e configurações
 * - Estatísticas e relatórios
 * - Gerenciamento de filas
 * - Operações de conta
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const establishmentController = require('../controllers/establishmentController');
const { authenticateToken, requireUserType } = require('../middleware/auth');
const { sanitizeParams, rateLimit } = require('../middleware/validation');

// ========================================
// ROTAS PÚBLICAS
// ========================================

/**
 * @route GET /api/establishments
 * @desc Lista estabelecimentos ativos (público)
 * @access Public
 * @query { limit, offset, search, category }
 */
router.get('/',
  sanitizeParams,
  establishmentController.listEstablishments
);

// ========================================
// ROTAS PRIVADAS - ESTABELECIMENTO
// ========================================

/**
 * @route GET /api/establishments/profile
 * @desc Obtém perfil do estabelecimento atual
 * @access Private (Estabelecimento)
 * @headers { Authorization: Bearer <token> }
 */
router.get('/profile',
  authenticateToken,
  requireUserType('estabelecimento'),
  establishmentController.getProfile
);

/**
 * @route PUT /api/establishments/profile
 * @desc Atualiza perfil do estabelecimento
 * @access Private (Estabelecimento)
 * @headers { Authorization: Bearer <token> }
 * @body { nome_empresa, cep_empresa, endereco_empresa, telefone_empresa, descricao, categoria, horario_funcionamento, capacidade_maxima }
 */
router.put('/profile',
  authenticateToken,
  requireUserType('estabelecimento'),
  rateLimit(60000, 10), // 10 tentativas por minuto
  establishmentController.updateProfile
);

/**
 * @route PUT /api/establishments/change-password
 * @desc Altera senha do estabelecimento
 * @access Private (Estabelecimento)
 * @headers { Authorization: Bearer <token> }
 * @body { currentPassword, newPassword }
 */
router.put('/change-password',
  authenticateToken,
  requireUserType('estabelecimento'),
  rateLimit(60000, 5), // 5 tentativas por minuto
  establishmentController.changePassword
);

/**
 * @route GET /api/establishments/stats
 * @desc Obtém estatísticas do estabelecimento
 * @access Private (Estabelecimento)
 * @headers { Authorization: Bearer <token> }
 */
router.get('/stats',
  authenticateToken,
  requireUserType('estabelecimento'),
  establishmentController.getEstablishmentStats
);

/**
 * @route GET /api/establishments/queues
 * @desc Obtém filas do estabelecimento
 * @access Private (Estabelecimento)
 * @headers { Authorization: Bearer <token> }
 */
router.get('/queues',
  authenticateToken,
  requireUserType('estabelecimento'),
  establishmentController.getEstablishmentQueues
);


/**
 * @route GET /api/establishments/daily-report
 * @desc Obtém relatório diário do estabelecimento
 * @access Private (Estabelecimento)
 * @headers { Authorization: Bearer <token> }
 * @query { date }
 */
router.get('/daily-report',
  authenticateToken,
  requireUserType('estabelecimento'),
  establishmentController.getDailyReport
);

/**
 * @route GET /api/establishments/:id/queues
 * @desc Obtém filas ativas de um estabelecimento (público)
 * @access Public
 */
router.get('/:id/queues',
  sanitizeParams,
  establishmentController.getEstablishmentQueuesPublic
);

/**
 * @route DELETE /api/establishments/account
 * @desc Deleta conta do estabelecimento
 * @access Private (Estabelecimento)
 * @headers { Authorization: Bearer <token> }
 * @body { password }
 */
router.delete('/account',
  authenticateToken,
  requireUserType('estabelecimento'),
  rateLimit(60000, 3), // 3 tentativas por minuto
  establishmentController.deleteAccount
);

// ========================================
// ROTAS ADMINISTRATIVAS
// ========================================

/**
 * @route GET /api/establishments/admin
 * @desc Lista todos os estabelecimentos (admin)
 * @access Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @query { limit, offset, search, status }
 */
router.get('/admin',
  authenticateToken,
  // TODO: Adicionar middleware de admin quando implementado
  sanitizeParams,
  establishmentController.listAllEstablishments
);

/**
 * @route PUT /api/establishments/:id/status
 * @desc Atualiza status do estabelecimento (admin)
 * @access Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @body { status }
 */
router.put('/:id/status',
  authenticateToken,
  // TODO: Adicionar middleware de admin quando implementado
  sanitizeParams,
  rateLimit(60000, 20), // 20 tentativas por minuto
  establishmentController.updateEstablishmentStatus
);

/**
 * @route DELETE /api/establishments/:id
 * @desc Remove estabelecimento (admin)
 * @access Private (Admin)
 * @headers { Authorization: Bearer <token> }
 */
router.delete('/:id',
  authenticateToken,
  // TODO: Adicionar middleware de admin quando implementado
  sanitizeParams,
  rateLimit(60000, 10), // 10 tentativas por minuto
  establishmentController.deleteEstablishment
);

/**
 * Middleware de tratamento de erros específico para rotas de estabelecimentos
 */
router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de estabelecimentos:', error);
  
  // Erro de validação
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.errors
    });
  }
  
  // Erro de rate limiting
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Muitas tentativas. Tente novamente em alguns minutos.'
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
 * @route GET /api/establishments/:id
 * @desc Obtém estabelecimento por ID (público)
 * @access Public
 * NOTA: Esta rota DEVE ser a ÚLTIMA para não interceptar outras rotas
 */
router.get('/:id',
  sanitizeParams,
  establishmentController.getEstablishmentById
);

module.exports = router;
