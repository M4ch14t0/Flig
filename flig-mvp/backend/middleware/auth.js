/**
 * Middleware de Autenticação JWT para Sistema Flig
 * 
 * Verifica e valida tokens JWT em requisições protegidas.
 * Extrai informações do usuário do token e adiciona ao objeto req.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../services/tokenBlacklist');

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Middleware de autenticação JWT
 * 
 * Verifica se o token JWT é válido e extrai informações do usuário
 * Adiciona req.user com dados do usuário autenticado
 */
async function authenticateToken(req, res, next) {
  try {
    // Obtém o token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Verifica e decodifica o token (usando Promise para async/await correto)
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error('❌ Token inválido:', err.message);
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      try {
        // Verifica se o token está na blacklist (CORRIGIDO: dentro do try-catch)
        const isBlacklisted = await tokenBlacklist.isTokenBlacklisted(token);

        if (isBlacklisted) {
          console.error('❌ Token na blacklist - logout realizado');
          return res.status(401).json({
            success: false,
            message: 'Token inválido - sessão expirada'
          });
        }

        // Adiciona dados do usuário ao objeto req
        req.user = {
          id: decoded.userId,
          userId: decoded.userId,
          email: decoded.email,
          userType: decoded.userType
        };
        
        console.log(`✅ Token válido: ${decoded.userType} ID ${decoded.userId}`);
        next();
      } catch (blacklistError) {
        console.error('❌ Erro ao verificar blacklist:', blacklistError);
        // Em caso de erro na blacklist, permite o acesso (fail-open)
        // Alternativa: fail-closed (rejeitar em caso de erro)
        req.user = {
          id: decoded.userId,
          userId: decoded.userId,
          email: decoded.email,
          userType: decoded.userType
        };
        next();
      }
    });

  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Middleware para verificar se o usuário é do tipo específico
 * 
 * @param {string} requiredUserType - Tipo de usuário requerido ('cliente' ou 'estabelecimento')
 */
function requireUserType(requiredUserType) {
  return (req, res, next) => {
    console.log('🔒 requireUserType - required:', requiredUserType, 'user:', req.user);
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (req.user.userType !== requiredUserType) {
      console.log('❌ User type mismatch:', req.user.userType, 'vs', requiredUserType);
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Tipo de usuário requerido: ${requiredUserType}`
      });
    }

    console.log('✅ User type authorized:', req.user.userType);
    next();
  };
}

/**
 * Middleware opcional de autenticação
 * 
 * Não retorna erro se não houver token, apenas adiciona req.user se existir
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        req.user = null;
      } else {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          userType: decoded.userType
        };
      }
      next();
    });

  } catch (error) {
    req.user = null;
    next();
  }
}

/**
 * Middleware para verificar se o usuário é o proprietário do recurso
 * 
 * @param {string} resourceUserIdParam - Nome do parâmetro que contém o ID do usuário do recurso
 */
function requireOwnership(resourceUserIdParam = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];
    
    if (req.user.userId.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você só pode acessar seus próprios recursos'
      });
    }

    next();
  };
}

/**
 * Middleware para verificar se o estabelecimento é o proprietário da fila
 */
function requireQueueOwnership(req, res, next) {
  if (!req.user || req.user.userType !== 'estabelecimento') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas estabelecimentos podem gerenciar filas'
    });
  }

  // A verificação de propriedade da fila será feita no controller
  // usando o estabelecimento_id da fila
  next();
}

module.exports = {
  authenticateToken,
  requireUserType,
  optionalAuth,
  requireOwnership,
  requireQueueOwnership
};
