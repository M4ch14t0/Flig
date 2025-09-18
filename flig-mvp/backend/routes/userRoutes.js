/**
 * Rotas de Usuários para Sistema Flig
 * 
 * Define todas as rotas relacionadas aos usuários (clientes):
 * - Perfil e configurações
 * - Estatísticas e histórico
 * - Operações de conta
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireUserType } = require('../middleware/auth');
const { sanitizeParams, rateLimit } = require('../middleware/validation');

/**
 * @route GET /api/users/profile
 * @desc Obtém perfil do usuário atual
 * @access Private (Cliente)
 * @headers { Authorization: Bearer <token> }
 */
router.get('/profile', 
  authenticateToken,
  requireUserType('cliente'),
  userController.getProfile
);

/**
 * @route PUT /api/users/profile
 * @desc Atualiza perfil do usuário
 * @access Private (Cliente)
 * @headers { Authorization: Bearer <token> }
 * @body { nome_usuario, telefone_usuario, cep_usuario, endereco_usuario, numero_usuario }
 */
router.put('/profile',
  authenticateToken,
  requireUserType('cliente'),
  rateLimit(60000, 10), // 10 tentativas por minuto
  userController.updateProfile
);

/**
 * @route PUT /api/users/change-password
 * @desc Altera senha do usuário
 * @access Private (Cliente)
 * @headers { Authorization: Bearer <token> }
 * @body { currentPassword, newPassword }
 */
router.put('/change-password',
  authenticateToken,
  requireUserType('cliente'),
  rateLimit(60000, 5), // 5 tentativas por minuto
  userController.changePassword
);

/**
 * @route GET /api/users/stats
 * @desc Obtém estatísticas do usuário
 * @access Private (Cliente)
 * @headers { Authorization: Bearer <token> }
 */
router.get('/stats',
  authenticateToken,
  requireUserType('cliente'),
  userController.getUserStats
);

/**
 * @route GET /api/users/queue-history
 * @desc Obtém histórico de filas do usuário
 * @access Private (Cliente)
 * @headers { Authorization: Bearer <token> }
 * @query { limit, offset, status }
 */
router.get('/queue-history',
  authenticateToken,
  requireUserType('cliente'),
  userController.getQueueHistory
);

/**
 * @route GET /api/users/active-queues
 * @desc Obtém filas ativas do usuário
 * @access Private (Cliente)
 * @headers { Authorization: Bearer <token> }
 */
router.get('/active-queues',
  authenticateToken,
  requireUserType('cliente'),
  userController.getActiveQueues
);

/**
 * @route DELETE /api/users/account
 * @desc Deleta conta do usuário
 * @access Private (Cliente)
 * @headers { Authorization: Bearer <token> }
 * @body { password }
 */
router.delete('/account',
  authenticateToken,
  requireUserType('cliente'),
  rateLimit(60000, 3), // 3 tentativas por minuto
  userController.deleteAccount
);

// ========================================
// ROTAS ADMINISTRATIVAS
// ========================================

/**
 * @route GET /api/users
 * @desc Lista todos os usuários (admin)
 * @access Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @query { limit, offset, search }
 */
router.get('/',
  authenticateToken,
  // TODO: Adicionar middleware de admin quando implementado
  sanitizeParams,
  userController.listUsers
);

/**
 * @route GET /api/users/:id
 * @desc Obtém usuário por ID (admin)
 * @access Private (Admin)
 * @headers { Authorization: Bearer <token> }
 */
router.get('/:id',
  authenticateToken,
  // TODO: Adicionar middleware de admin quando implementado
  sanitizeParams,
  userController.getUserById
);

/**
 * @route PUT /api/users/:id
 * @desc Atualiza usuário (admin)
 * @access Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @body { nome_usuario, telefone_usuario, email_usuario, cep_usuario, endereco_usuario, numero_usuario }
 */
router.put('/:id',
  authenticateToken,
  // TODO: Adicionar middleware de admin quando implementado
  sanitizeParams,
  rateLimit(60000, 20), // 20 tentativas por minuto
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Remove usuário (admin)
 * @access Private (Admin)
 * @headers { Authorization: Bearer <token> }
 */
router.delete('/:id',
  authenticateToken,
  // TODO: Adicionar middleware de admin quando implementado
  sanitizeParams,
  rateLimit(60000, 10), // 10 tentativas por minuto
  userController.deleteUser
);

/**
 * Middleware de tratamento de erros específico para rotas de usuários
 */
router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de usuários:', error);
  
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

module.exports = router;

