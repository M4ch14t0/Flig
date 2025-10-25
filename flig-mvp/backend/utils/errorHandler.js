/**
 * Utilitário para Tratamento de Erros do Sistema Flig
 * 
 * Centraliza o tratamento de erros e padroniza respostas de erro.
 * Inclui logging estruturado e categorização de erros.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

/**
 * Tipos de erro categorizados
 */
const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  DATABASE: 'DATABASE_ERROR',
  REDIS: 'REDIS_ERROR',
  EXTERNAL_API: 'EXTERNAL_API_ERROR',
  INTERNAL: 'INTERNAL_ERROR'
};

/**
 * Códigos de status HTTP padronizados
 */
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Classe para erros customizados
 */
class AppError extends Error {
  constructor(message, type, statusCode, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de tratamento de erros
 */
function globalErrorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  logError(err, req);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, ERROR_TYPES.VALIDATION, HTTP_STATUS.BAD_REQUEST);
  }

  // Erro de duplicação de chave única
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Recurso já existe';
    error = new AppError(message, ERROR_TYPES.VALIDATION, HTTP_STATUS.CONFLICT);
  }

  // Erro de chave estrangeira
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Referência inválida';
    error = new AppError(message, ERROR_TYPES.VALIDATION, HTTP_STATUS.BAD_REQUEST);
  }

  // Erro de conexão com banco
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    const message = 'Erro de conexão com banco de dados';
    error = new AppError(message, ERROR_TYPES.DATABASE, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  // Erro de Redis
  if (err.message && err.message.includes('Redis')) {
    const message = 'Serviço de filas temporariamente indisponível';
    error = new AppError(message, ERROR_TYPES.REDIS, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new AppError(message, ERROR_TYPES.AUTHENTICATION, HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new AppError(message, ERROR_TYPES.AUTHENTICATION, HTTP_STATUS.UNAUTHORIZED);
  }

  // Se não for um erro operacional, criar um erro genérico
  if (!error.isOperational) {
    error = new AppError(
      'Erro interno do servidor',
      ERROR_TYPES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // Resposta padronizada
  const response = {
    success: false,
    error: {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp
    }
  };

  // Adicionar detalhes em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.details = error.details;
  }

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
}

/**
 * Função para logging estruturado de erros
 */
function logError(err, req) {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: err.message,
    type: err.type || 'UNKNOWN_ERROR',
    statusCode: err.statusCode || 500,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || null
    }
  };

  // Log baseado no ambiente
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar logger estruturado (ex: Winston)
    console.error(JSON.stringify(logData));
  } else {
    // Em desenvolvimento, log mais detalhado
    console.error('🚨 ERRO:', logData);
  }
}

/**
 * Função para criar erros de validação
 */
function createValidationError(message, details = null) {
  return new AppError(message, ERROR_TYPES.VALIDATION, HTTP_STATUS.BAD_REQUEST, details);
}

/**
 * Função para criar erros de autenticação
 */
function createAuthError(message = 'Não autorizado') {
  return new AppError(message, ERROR_TYPES.AUTHENTICATION, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Função para criar erros de autorização
 */
function createAuthorizationError(message = 'Acesso negado') {
  return new AppError(message, ERROR_TYPES.AUTHORIZATION, HTTP_STATUS.FORBIDDEN);
}

/**
 * Função para criar erros de não encontrado
 */
function createNotFoundError(resource = 'Recurso') {
  return new AppError(`${resource} não encontrado`, ERROR_TYPES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
}

/**
 * Função para criar erros de banco de dados
 */
function createDatabaseError(message = 'Erro no banco de dados') {
  return new AppError(message, ERROR_TYPES.DATABASE, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

/**
 * Função para criar erros de Redis
 */
function createRedisError(message = 'Erro no serviço de filas') {
  return new AppError(message, ERROR_TYPES.REDIS, HTTP_STATUS.SERVICE_UNAVAILABLE);
}

/**
 * Wrapper para funções assíncronas com tratamento de erro
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware para capturar erros de rotas não encontradas
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Rota ${req.originalUrl} não encontrada`,
    ERROR_TYPES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND
  );
  next(error);
}

export {
  AppError,
  ERROR_TYPES,
  HTTP_STATUS,
  globalErrorHandler,
  logError,
  createValidationError,
  createAuthError,
  createAuthorizationError,
  createNotFoundError,
  createDatabaseError,
  createRedisError,
  asyncHandler,
  notFoundHandler
};



