/**
 * Rotas de Autenticação para Sistema Flig
 * 
 * Define todas as rotas relacionadas à autenticação:
 * - Registro de usuários e estabelecimentos
 * - Login de usuários e estabelecimentos
 * - Verificação de token
 * - Logout
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import passwordResetController from '../controllers/passwordResetController.js';
import passwordResetControllerSimple from '../controllers/passwordResetControllerSimple.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  validateUserRegistration, 
  validateEstablishmentRegistration,
  validateLogin,
  rateLimit 
} from '../middleware/validation.js';
import cnpjValidation from '../services/cnpjValidation.js';

/**
 * @route POST /api/auth/register/user
 * @desc Registra um novo usuário (cliente)
 * @access Public
 * @body { nome_usuario, cpf, telefone_usuario, email_usuario, senha_usuario, cep_usuario, endereco_usuario, numero_usuario }
 */
router.post('/register/user', 
  rateLimit(60000, 5), // 5 tentativas por minuto
  (req, res, next) => {
    console.log('🔍 POST /api/auth/register/user - Request received');
    console.log('🔍 Request body:', req.body);
    next();
  },
  validateUserRegistration,
  authController.registerUser
);

/**
 * @route POST /api/auth/register/establishment
 * @desc Registra um novo estabelecimento
 * @access Public
 * @body { nome_empresa, cnpj, cep_empresa, endereco_empresa, telefone_empresa, email_empresa, senha_empresa, descricao, categoria, horario_funcionamento }
 */
router.post('/register/establishment',
  rateLimit(60000, 5), // 5 tentativas por minuto
  (req, res, next) => {
    console.log('🔍 POST /api/auth/register/establishment - Request received');
    console.log('🔍 Request body:', req.body);
    next();
  },
  validateEstablishmentRegistration,
  authController.registerEstablishment
);

/**
 * @route POST /api/auth/login/user
 * @desc Login de usuário (cliente)
 * @access Public
 * @body { email_usuario, senha_usuario }
 */
router.post('/login/user',
  rateLimit(60000, 10), // 10 tentativas por minuto
  validateLogin,
  authController.loginUser
);

/**
 * @route POST /api/auth/login/establishment
 * @desc Login de estabelecimento
 * @access Public
 * @body { email_empresa, senha_empresa }
 */
router.post('/login/establishment',
  rateLimit(60000, 10), // 10 tentativas por minuto
  validateLogin,
  authController.loginEstablishment
);

/**
 * @route GET /api/auth/me
 * @desc Obtém dados do usuário atual
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.get('/me', 
  authenticateToken,
  authController.getCurrentUser
);

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.post('/logout',
  authenticateToken,
  authController.logout
);

/**
 * @route POST /api/auth/logout-all
 * @desc Logout em todas as sessões do usuário
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.post('/logout-all',
  authenticateToken,
  authController.logoutAll
);

/**
 * @route POST /api/auth/refresh
 * @desc Renova token JWT
 * @access Private
 * @headers { Authorization: Bearer <token> }
 */
router.post('/refresh',
  authenticateToken,
  (req, res) => {
    // Em uma implementação mais robusta, você verificaria se o token está próximo do vencimento
    // e emitiria um novo token
    res.json({
      success: true,
      message: 'Token ainda válido',
      data: {
        token: req.headers['authorization'].split(' ')[1]
      }
    });
  }
);

/**
 * @route POST /api/auth/validate-cnpj
 * @desc Valida CNPJ usando API CNPJá
 * @access Public (com rate limiting)
 * @body { cnpj }
 */
router.post('/validate-cnpj',
  rateLimit(60000, 10), // 10 tentativas por minuto
  async (req, res) => {
    try {
      const { cnpj } = req.body;

      if (!cnpj) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ é obrigatório'
        });
      }

      const result = await cnpjValidation.validateCNPJWithAPI(cnpj);
      
      res.json({
        success: result.valid,
        message: result.message,
        data: result.data,
        warning: result.warning
      });

    } catch (error) {
      console.error('❌ Erro ao validar CNPJ:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao validar CNPJ'
      });
    }
  }
);

/**
 * Middleware de tratamento de erros específico para rotas de autenticação
 */
router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de autenticação:', error);
  
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
 * ROTAS DE RECUPERAÇÃO DE SENHA
 * Rotas para solicitar e redefinir senha
 */

// Solicitar recuperação de senha (público - para usuários não logados)
router.post('/forgot-password', rateLimit, passwordResetController.forgotPassword);

// Solicitar recuperação de senha (privado - para usuários logados)
router.post('/forgot-password-authenticated',
  authenticateToken,
  rateLimit,
  passwordResetController.forgotPassword
);

// ROTA TEMPORÁRIA PARA DEBUG (SEM AUTENTICAÇÃO)
router.post('/forgot-password-simple',
  rateLimit,
  passwordResetControllerSimple.forgotPasswordSimple
);

// ROTA TEMPORÁRIA PARA DEBUG (COM AUTENTICAÇÃO SIMPLES) - REMOVIDA

// ROTA TEMPORÁRIA PARA DEBUG (SEM RATE LIMITING)
router.post('/forgot-password-debug',
  passwordResetControllerSimple.forgotPasswordSimple
);

// Validar token de redefinição
router.get('/validate-reset-token/:token', passwordResetController.validateResetToken);

// Redefinir senha com token
router.post('/reset-password', rateLimit(60000, 5), passwordResetController.resetPassword);

export default router;

