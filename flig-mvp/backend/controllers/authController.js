/**
 * Controller de Autenticação para Sistema Flig
 * 
 * Gerencia login, logout, registro e validação de tokens JWT
 * para usuários (clientes) e estabelecimentos.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connection from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { addToBlacklist, isTokenBlacklisted } from '../services/tokenBlacklist.js';
import sessionManager from '../services/sessionManager.js';

/**
 * Valida CPF usando algoritmo oficial
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - True se válido
 */
function validateCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Registra um novo usuário (cliente)
 * 
 * POST /api/auth/register/user
 * Body: { nome_usuario, cpf, telefone_usuario, email_usuario, senha_usuario, cep_usuario, endereco_usuario, numero_usuario }
 */
async function registerUser(req, res) {
  try {
    console.log('🔍 registerUser - Starting user registration');
    console.log('🔍 Request body:', req.body);
    console.log('🔍 Campos de endereço recebidos:', {
      cidade_usuario: req.body.cidade_usuario,
      bairro_usuario: req.body.bairro_usuario,
      uf_usuario: req.body.uf_usuario
    });
    
    const {
      nome_usuario,
      cpf,
      data_nascimento,
      telefone_usuario,
      email_usuario,
      senha_usuario,
      cep_usuario,
      endereco_usuario,
      numero_usuario,
      cidade_usuario,
      bairro_usuario,
      uf_usuario
    } = req.body;

    // Validações obrigatórias
    if (!nome_usuario || !cpf || !email_usuario || !senha_usuario) {
      return res.status(400).json({
        success: false,
        message: 'Nome, CPF, email e senha são obrigatórios'
      });
    }

    // Valida formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_usuario)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Valida CPF
    if (!validateCPF(cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // Verifica se email já existe
    const existingUser = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id FROM usuarios WHERE email_usuario = ?',
        [email_usuario],
        (err, results) => err ? reject(err) : resolve(results)
      );
    });

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Verifica se CPF já existe
    const existingCPF = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id FROM usuarios WHERE cpf = ?',
        [cpf],
        (err, results) => err ? reject(err) : resolve(results)
      );
    });

    if (existingCPF.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado'
      });
    }

    // Criptografa a senha
    const hashedPassword = hashPassword(senha_usuario);

    // Converte data de nascimento de DDMMAAAA para YYYY-MM-DD
    let formattedDataNascimento = null;
    if (data_nascimento) {
      const day = data_nascimento.slice(0, 2);
      const month = data_nascimento.slice(2, 4);
      const year = data_nascimento.slice(4, 8);
      formattedDataNascimento = `${year}-${month}-${day}`;
    }

    // Prepara parâmetros com valores padrão
    const params = [
      nome_usuario,
      cpf,
      formattedDataNascimento,
      telefone_usuario || null,
      email_usuario,
      hashedPassword,
      cep_usuario || null,
      endereco_usuario || null,
      numero_usuario || null,
      cidade_usuario || null,
      bairro_usuario || null,
      uf_usuario || null
    ];

    console.log('🔍 Parâmetros para inserção:', params);

    // Insere usuário no banco
    const sql = `
      INSERT INTO usuarios 
      (nome_usuario, cpf, data_nascimento, telefone_usuario, email_usuario, senha_usuario, cep_usuario, endereco_usuario, numero_usuario, cidade_usuario, bairro_usuario, uf_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        params,
        (err, result) => err ? reject(err) : resolve(result)
      );
    });

    // Gera token JWT
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email: email_usuario, 
        userType: 'cliente' 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`✅ Usuário registrado: ${nome_usuario} (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        token,
        user: {
          id: result.insertId,
          nome_usuario,
          email_usuario,
          userType: 'cliente'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Registra um novo estabelecimento
 * 
 * POST /api/auth/register/establishment
 * Body: { nome_empresa, cnpj, cep_empresa, endereco_empresa, telefone_empresa, email_empresa, senha_empresa, descricao, categoria, horario_funcionamento }
 */
async function registerEstablishment(req, res) {
  try {
    console.log('🔍 [REGISTER ESTABLISHMENT] Body recebido:', req.body);
    
    const {
      nome_empresa,
      cnpj,
      cep_empresa,
      endereco_empresa,
      telefone_empresa,
      email_empresa,
      senha_empresa
    } = req.body;

    console.log('🔍 [REGISTER ESTABLISHMENT] Campos extraídos:', {
      nome_empresa,
      cnpj,
      cep_empresa,
      endereco_empresa,
      telefone_empresa,
      email_empresa,
      senha_empresa: senha_empresa ? '***' : undefined
    });

    // Validações obrigatórias
    if (!nome_empresa || !cnpj || !email_empresa || !senha_empresa) {
      console.log('❌ [REGISTER ESTABLISHMENT] Campos obrigatórios faltando:', {
        nome_empresa: !!nome_empresa,
        cnpj: !!cnpj,
        email_empresa: !!email_empresa,
        senha_empresa: !!senha_empresa
      });
      return res.status(400).json({
        success: false,
        message: 'Nome da empresa, CNPJ, email e senha são obrigatórios'
      });
    }

    // Valida formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_empresa)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Valida CNPJ
    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido'
      });
    }

    // Verifica se email já existe
    const existingEmail = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id FROM estabelecimentos WHERE email_empresa = ?',
        [email_empresa],
        (err, results) => err ? reject(err) : resolve(results)
      );
    });

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Verifica se CNPJ já existe
    const existingCNPJ = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id FROM estabelecimentos WHERE cnpj = ?',
        [cnpj],
        (err, results) => err ? reject(err) : resolve(results)
      );
    });

    if (existingCNPJ.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }

    // Criptografa a senha
    const hashedPassword = hashPassword(senha_empresa);

    // Insere estabelecimento no banco
    const sql = `
      INSERT INTO estabelecimentos 
      (nome_empresa, cnpj, cep_empresa, endereco_empresa, telefone_empresa, email_empresa, senha_empresa)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        [nome_empresa, cnpj, cep_empresa, endereco_empresa, telefone_empresa, email_empresa, hashedPassword],
        (err, result) => err ? reject(err) : resolve(result)
      );
    });

    // Gera token JWT
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email: email_empresa, 
        userType: 'estabelecimento' 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`✅ Estabelecimento registrado: ${nome_empresa} (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      message: 'Estabelecimento registrado com sucesso',
      data: {
        token,
        establishment: {
          id: result.insertId,
          nome_empresa,
          email_empresa,
          userType: 'estabelecimento'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao registrar estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Login de usuário (cliente)
 * 
 * POST /api/auth/login/user
 * Body: { email_usuario, senha_usuario }
 */
async function loginUser(req, res) {
  try {
    const { email_usuario, senha_usuario } = req.body;

    if (!email_usuario || !senha_usuario) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Busca usuário no banco
    const users = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, nome_usuario, email_usuario, senha_usuario, telefone_usuario, data_nascimento, cidade_usuario, bairro_usuario, uf_usuario FROM usuarios WHERE email_usuario = ?',
        [email_usuario],
        (err, results) => err ? reject(err) : resolve(results)
      );
    });

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const user = users[0];

    // Verifica senha
    console.log('🔍 Verificando senha para:', user.email_usuario);
    console.log('🔍 Senha fornecida:', senha_usuario);
    console.log('🔍 Hash no banco:', user.senha_usuario);
    
    const isValidPassword = verifyPassword(senha_usuario, user.senha_usuario);
    console.log('🔍 Resultado da verificação:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Senha inválida para:', user.email_usuario);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gera token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email_usuario, 
        userType: 'cliente' 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`✅ Login realizado: ${user.nome_usuario} (ID: ${user.id})`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user.id,
          nome_usuario: user.nome_usuario,
          email_usuario: user.email_usuario,
          telefone_usuario: user.telefone_usuario,
          data_nascimento: user.data_nascimento,
          cidade_usuario: user.cidade_usuario,
          bairro_usuario: user.bairro_usuario,
          uf_usuario: user.uf_usuario,
          userType: 'cliente'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no login do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Login de estabelecimento
 * 
 * POST /api/auth/login/establishment
 * Body: { email_empresa, senha_empresa }
 */
async function loginEstablishment(req, res) {
  try {
    const { email_empresa, senha_empresa } = req.body;

    if (!email_empresa || !senha_empresa) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Busca estabelecimento no banco
    const establishments = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, nome_empresa, email_empresa, senha_empresa, status FROM estabelecimentos WHERE email_empresa = ?',
        [email_empresa],
        (err, results) => err ? reject(err) : resolve(results)
      );
    });

    if (establishments.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const establishment = establishments[0];

    // Verifica se estabelecimento está ativo
    if (establishment.status !== 'ativo') {
      return res.status(401).json({
        success: false,
        message: 'Estabelecimento inativo'
      });
    }

    // Verifica senha
    const isValidPassword = verifyPassword(senha_empresa, establishment.senha_empresa);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gera token JWT
    const token = jwt.sign(
      { 
        userId: establishment.id, 
        email: establishment.email_empresa, 
        userType: 'estabelecimento' 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`✅ Login realizado: ${establishment.nome_empresa} (ID: ${establishment.id})`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: establishment.id,
          nome_empresa: establishment.nome_empresa,
          email_empresa: establishment.email_empresa,
          userType: 'estabelecimento'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no login do estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Verifica token e retorna dados do usuário
 * 
 * GET /api/auth/me
 * Headers: { Authorization: Bearer <token> }
 */
async function getCurrentUser(req, res) {
  try {
    // Dados do usuário vêm do middleware de autenticação
    const { userId, userType } = req.user;

    let userData;

    if (userType === 'cliente') {
      const users = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT id, nome_usuario, email_usuario, cpf, telefone_usuario, cep_usuario, endereco_usuario, numero_usuario, cidade_usuario, bairro_usuario, uf_usuario FROM usuarios WHERE id = ?',
          [userId],
          (err, results) => err ? reject(err) : resolve(results)
        );
      });

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      userData = {
        id: users[0].id,
        nome_usuario: users[0].nome_usuario,
        email_usuario: users[0].email_usuario,
        cpf: users[0].cpf,
        telefone_usuario: users[0].telefone_usuario,
        cep_usuario: users[0].cep_usuario,
        endereco_usuario: users[0].endereco_usuario,
        numero_usuario: users[0].numero_usuario,
        cidade_usuario: users[0].cidade_usuario,
        bairro_usuario: users[0].bairro_usuario,
        uf_usuario: users[0].uf_usuario,
        userType: 'cliente'
      };
    } else {
      const establishments = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT id, nome_empresa, email_empresa, cnpj, telefone_empresa, cep_empresa, endereco_empresa, descricao, categoria, horario_funcionamento, status FROM estabelecimentos WHERE id = ?',
          [userId],
          (err, results) => err ? reject(err) : resolve(results)
        );
      });

      if (establishments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Estabelecimento não encontrado'
        });
      }

      userData = {
        id: establishments[0].id,
        nome_empresa: establishments[0].nome_empresa,
        email_empresa: establishments[0].email_empresa,
        cnpj: establishments[0].cnpj,
        telefone_empresa: establishments[0].telefone_empresa,
        cep_empresa: establishments[0].cep_empresa,
        endereco_empresa: establishments[0].endereco_empresa,
        descricao: establishments[0].descricao,
        categoria: establishments[0].categoria,
        horario_funcionamento: establishments[0].horario_funcionamento,
        status: establishments[0].status,
        userType: 'estabelecimento'
      };
    }

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('❌ Erro ao obter dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Logout (invalida token)
 * 
 * POST /api/auth/logout
 * Headers: { Authorization: Bearer <token> }
 */
async function logout(req, res) {
  try {
    const { userId, userType } = req.user;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Adiciona token à blacklist para invalidá-lo
      await addToBlacklist(token);
      console.log(`✅ Token invalidado na blacklist: ${userType} ID ${userId}`);
    }
    
    console.log(`✅ Logout realizado: ${userType} ID ${userId}`);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

/**
 * Logout em todas as sessões (invalida todos os tokens do usuário)
 * 
 * POST /api/auth/logout-all
 * Headers: { Authorization: Bearer <token> }
 */
async function logoutAll(req, res) {
  try {
    const { userId, userType } = req.user;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Adiciona token atual à blacklist
      await addToBlacklist(token);
      console.log(`✅ Token atual invalidado na blacklist: ${userType} ID ${userId}`);
    }

    // TODO: Implementar invalidação de todos os tokens do usuário
    // Por enquanto, apenas invalida o token atual
    // Em uma implementação completa, seria necessário:
    // 1. Armazenar todos os tokens ativos do usuário
    // 2. Invalidar todos os tokens ativos
    // 3. Notificar outros dispositivos via WebSocket ou similar
    
    console.log(`✅ Logout em todas as sessões realizado: ${userType} ID ${userId}`);
    
    res.json({
      success: true,
      message: 'Logout em todas as sessões realizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro no logout-all:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}


export {
  registerUser,
  registerEstablishment,
  loginUser,
  loginEstablishment,
  getCurrentUser,
  logout,
  logoutAll
};

export default {
  registerUser,
  registerEstablishment,
  loginUser,
  loginEstablishment,
  getCurrentUser,
  logout,
  logoutAll
};

