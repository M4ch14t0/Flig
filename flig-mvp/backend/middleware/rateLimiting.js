/**
 * Middleware de Rate Limiting para Sistema Flig
 * 
 * Implementa limitação de taxa para prevenir ataques de força bruta,
 * DDoS e abuso da API. Diferentes limites para diferentes endpoints.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter geral para todas as rotas
 * 10000 requisições por 5 minutos por IP (DESENVOLVIMENTO)
 */
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10000, // máximo 10000 requisições por IP (DESENVOLVIMENTO)
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 5 minutos.',
    retryAfter: '5 minutos'
  },
  standardHeaders: true, // Retorna rate limit info nos headers
  legacyHeaders: false, // Desabilita headers X-RateLimit-*
  handler: (req, res) => {
    console.log(`🚫 Rate limit excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente em 5 minutos.',
      retryAfter: '5 minutos'
    });
  }
});

/**
 * Rate limiter para autenticação (login/registro)
 * 10000 tentativas por 5 minutos por IP (DESENVOLVIMENTO)
 */
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10000, // máximo 10000 tentativas de login por IP (DESENVOLVIMENTO)
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 5 minutos.',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚫 Rate limit de autenticação excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de login. Tente novamente em 5 minutos.',
      retryAfter: '5 minutos'
    });
  }
});

/**
 * Rate limiter para operações de fila
 * 1000 requisições por 5 minutos por IP (DESENVOLVIMENTO)
 */
const queueLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 1000, // máximo 1000 operações de fila por IP (DESENVOLVIMENTO)
  message: {
    success: false,
    message: 'Muitas operações de fila. Tente novamente em 5 minutos.',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚫 Rate limit de fila excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas operações de fila. Tente novamente em 5 minutos.',
      retryAfter: '5 minutos'
    });
  }
});

/**
 * Rate limiter para validação de CNPJ
 * 10 validações por hora por IP
 */
const cnpjLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 validações de CNPJ por IP
  message: {
    success: false,
    message: 'Muitas validações de CNPJ. Tente novamente em 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚫 Rate limit de CNPJ excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas validações de CNPJ. Tente novamente em 1 hora.',
      retryAfter: '1 hora'
    });
  }
});

/**
 * Rate limiter para pagamentos
 * 3 tentativas por 10 minutos por IP
 */
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 3, // máximo 3 tentativas de pagamento por IP
  message: {
    success: false,
    message: 'Muitas tentativas de pagamento. Tente novamente em 10 minutos.',
    retryAfter: '10 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚫 Rate limit de pagamento excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de pagamento. Tente novamente em 10 minutos.',
      retryAfter: '10 minutos'
    });
  }
});

/**
 * Rate limiter para notificações
 * 20 notificações por 5 minutos por IP
 */
const notificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 notificações por IP
  message: {
    success: false,
    message: 'Muitas notificações. Tente novamente em 5 minutos.',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚫 Rate limit de notificação excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas notificações. Tente novamente em 5 minutos.',
      retryAfter: '5 minutos'
    });
  }
});

export {
  generalLimiter,
  authLimiter,
  queueLimiter,
  cnpjLimiter,
  paymentLimiter,
  notificationLimiter
};
