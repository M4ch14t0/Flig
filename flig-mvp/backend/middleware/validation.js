/**
 * Middleware de Validação para Sistema Flig
 * 
 * Valida dados de entrada, sanitiza inputs e verifica formatos.
 * Previne ataques de injeção e garante integridade dos dados.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

/**
 * Middleware para validar dados de registro de usuário
 */
function validateUserRegistration(req, res, next) {
  const { nome_usuario, cpf, email_usuario, senha_usuario } = req.body;
  const errors = [];

  // Validação do nome
  if (!nome_usuario || nome_usuario.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  // Validação do CPF
  if (!cpf || !validateCPF(cpf)) {
    errors.push('CPF inválido');
  }

  // Validação do email
  if (!email_usuario || !validateEmail(email_usuario)) {
    errors.push('Email inválido');
  }

  // Validação da senha
  if (!senha_usuario || senha_usuario.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  // Sanitiza dados
  req.body.nome_usuario = nome_usuario.trim();
  req.body.cpf = cpf.replace(/[^\d]/g, '');
  req.body.email_usuario = email_usuario.toLowerCase().trim();

  next();
}

/**
 * Middleware para validar dados de registro de estabelecimento
 */
function validateEstablishmentRegistration(req, res, next) {
  const { nome_empresa, cnpj, email_empresa, senha_empresa } = req.body;
  const errors = [];

  // Validação do nome da empresa
  if (!nome_empresa || nome_empresa.trim().length < 2) {
    errors.push('Nome da empresa deve ter pelo menos 2 caracteres');
  }

  // Validação do CNPJ
  if (!cnpj || !validateCNPJ(cnpj)) {
    errors.push('CNPJ inválido');
  }

  // Validação do email
  if (!email_empresa || !validateEmail(email_empresa)) {
    errors.push('Email inválido');
  }

  // Validação da senha
  if (!senha_empresa || senha_empresa.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  // Sanitiza dados
  req.body.nome_empresa = nome_empresa.trim();
  req.body.cnpj = cnpj.replace(/[^\d]/g, '');
  req.body.email_empresa = email_empresa.toLowerCase().trim();

  next();
}

/**
 * Middleware para validar dados de login
 */
function validateLogin(req, res, next) {
  const { email_usuario, senha_usuario, email_empresa, senha_empresa } = req.body;
  const errors = [];

  // Verifica se é login de usuário ou estabelecimento
  const email = email_usuario || email_empresa;
  const password = senha_usuario || senha_empresa;

  if (!email || !validateEmail(email)) {
    errors.push('Email inválido');
  }

  if (!password || password.length < 1) {
    errors.push('Senha é obrigatória');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  // Sanitiza email
  req.body.email = email.toLowerCase().trim();

  next();
}

/**
 * Middleware para validar dados de criação de fila
 */
function validateQueueCreation(req, res, next) {
  const { nome, descricao, max_avancos, valor_avancos, tempo_estimado } = req.body;
  const errors = [];

  if (!nome || nome.trim().length < 2) {
    errors.push('Nome da fila deve ter pelo menos 2 caracteres');
  }

  if (max_avancos && (max_avancos < 1 || max_avancos > 8)) {
    errors.push('Máximo de avanços deve estar entre 1 e 8');
  }

  if (valor_avancos && (valor_avancos < 0 || valor_avancos > 100)) {
    errors.push('Valor por avanço deve estar entre 0 e 100');
  }

  if (tempo_estimado && (tempo_estimado < 1 || tempo_estimado > 60)) {
    errors.push('Tempo estimado deve estar entre 1 e 60 minutos');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  // Sanitiza dados
  req.body.nome = nome.trim();
  req.body.descricao = descricao ? descricao.trim() : '';

  next();
}

/**
 * Middleware para validar dados de entrada na fila
 */
function validateJoinQueue(req, res, next) {
  const { nome, telefone, email } = req.body;
  const errors = [];

  if (!nome || nome.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (!telefone || !validatePhone(telefone)) {
    errors.push('Telefone inválido');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Email inválido');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  // Sanitiza dados
  req.body.nome = nome.trim();
  req.body.telefone = telefone.replace(/[^\d]/g, '');
  req.body.email = email.toLowerCase().trim();

  next();
}

/**
 * Middleware para validar dados de pagamento
 */
function validatePayment(req, res, next) {
  const { clientId, positions, paymentData } = req.body;
  const errors = [];

  if (!clientId || typeof clientId !== 'string') {
    errors.push('ID do cliente é obrigatório');
  }

  if (!positions || positions < 1 || positions > 8) {
    errors.push('Número de posições deve estar entre 1 e 8');
  }

  if (!paymentData || !paymentData.paymentMethod) {
    errors.push('Dados de pagamento são obrigatórios');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  next();
}

/**
 * Middleware para sanitizar parâmetros de URL
 */
function sanitizeParams(req, res, next) {
  // Sanitiza IDs numéricos
  if (req.params.id) {
    req.params.id = req.params.id.replace(/[^\d]/g, '');
  }

  if (req.params.queueId) {
    req.params.queueId = req.params.queueId.replace(/[^a-zA-Z0-9-]/g, '');
  }

  if (req.params.clientId) {
    req.params.clientId = req.params.clientId.replace(/[^a-zA-Z0-9-]/g, '');
  }

  next();
}

/**
 * Middleware para rate limiting básico
 */
const rateLimitMap = new Map();

function rateLimit(windowMs = 60000, maxRequests = 100) {
  return (req, res, next) => {
    // Desabilita rate limiting durante testes
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpa requisições antigas
    if (rateLimitMap.has(clientId)) {
      const requests = rateLimitMap.get(clientId).filter(time => time > windowStart);
      rateLimitMap.set(clientId, requests);
    } else {
      rateLimitMap.set(clientId, []);
    }

    const requests = rateLimitMap.get(clientId);

    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Muitas requisições. Tente novamente em alguns minutos.'
      });
    }

    requests.push(now);
    next();
  };
}

// Funções auxiliares de validação

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateCPF(cpf) {
  if (!cpf) return false;
  
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;
  
  return true;
}

function validateCNPJ(cnpj) {
  if (!cnpj) return false;
  
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  
  let soma = 0;
  let peso = 2;
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpj[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  if (digito1 !== parseInt(cnpj[12])) return false;
  
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpj[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  if (digito2 !== parseInt(cnpj[13])) return false;
  
  return true;
}

function validatePhone(phone) {
  const phoneRegex = /^[\d\s\(\)\-\+]{10,15}$/;
  return phoneRegex.test(phone);
}

module.exports = {
  validateUserRegistration,
  validateEstablishmentRegistration,
  validateLogin,
  validateQueueCreation,
  validateJoinQueue,
  validatePayment,
  sanitizeParams,
  rateLimit
};
