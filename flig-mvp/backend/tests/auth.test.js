/**
 * Testes de Autenticação para Sistema Flig
 * 
 * Testa funcionalidades de login, registro e validação de tokens JWT.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const request = require('supertest');
const app = require('../app');
const connection = require('../config/db');

describe('Authentication Tests', () => {
  let testTimestamp;
  let userToken;
  let establishmentToken;
  
  // Gera timestamp único para cada execução de teste
  beforeAll(() => {
    testTimestamp = Date.now();
  });

  // Limpa dados de teste antes de cada teste
  beforeEach(async () => {
    await new Promise((resolve, reject) => {
      connection.query('DELETE FROM usuarios WHERE email_usuario LIKE "%test%"', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      connection.query('DELETE FROM estabelecimentos WHERE email_empresa LIKE "%test%"', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('POST /api/auth/register/user', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        cpf: `${testTimestamp}${Math.floor(Math.random() * 1000)}`,
        telefone_usuario: '(11) 99999-9999',
        email_usuario: `joao.test.${testTimestamp}@example.com`,
        senha_usuario: '123456',
        cep_usuario: '01234-567',
        endereco_usuario: 'Rua Teste, 123',
        numero_usuario: '123'
      };

      const response = await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.nome_usuario).toBe(userData.nome_usuario);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        cpf: `${testTimestamp}${Math.floor(Math.random() * 1000)}`,
        email_usuario: 'email-invalido',
        senha_usuario: '123456'
      };

      const response = await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dados inválidos');
    });

    it('should reject registration with invalid CPF', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        cpf: '123',
        email_usuario: `joao.test.${testTimestamp + 1}@example.com`,
        senha_usuario: '123456'
      };

      const response = await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dados inválidos');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        cpf: `${testTimestamp}${Math.floor(Math.random() * 1000)}`,
        email_usuario: `joao.test.${testTimestamp + 2}@example.com`,
        senha_usuario: '123456'
      };

      // Primeiro registro
      await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(201);

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email já cadastrado');
    });
  });

  describe('POST /api/auth/register/establishment', () => {
    it('should register a new establishment successfully', async () => {
      const establishmentData = {
        nome_empresa: 'Restaurante Teste',
        cnpj: '12345678000195',
        email_empresa: `restaurante.test.${testTimestamp}@example.com`,
        senha_empresa: '123456',
        categoria: 'Restaurante',
        telefone_empresa: '(11) 3333-4444',
        endereco_empresa: 'Rua Teste, 456'
      };

      const response = await request(app)
        .post('/api/auth/register/establishment')
        .send(establishmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.establishment.nome_empresa).toBe(establishmentData.nome_empresa);
    });

    it('should reject registration with invalid CNPJ', async () => {
      const establishmentData = {
        nome_empresa: 'Restaurante Teste',
        cnpj: '123',
        email_empresa: `restaurante.test.${testTimestamp + 3}@example.com`,
        senha_empresa: '123456',
        categoria: 'Restaurante'
      };

      const response = await request(app)
        .post('/api/auth/register/establishment')
        .send(establishmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dados inválidos');
    });
  });

  describe('POST /api/auth/login/user', () => {
    beforeEach(async () => {
      // Cria usuário para teste de login
      const userData = {
        nome_usuario: 'João Silva',
        cpf: `${testTimestamp}${Math.floor(Math.random() * 1000)}`,
        telefone_usuario: '(11) 99999-9999',
        email_usuario: `joao.login.${testTimestamp}@example.com`,
        senha_usuario: '123456',
        cep_usuario: '01234-567',
        endereco_usuario: 'Rua Teste, 123',
        numero_usuario: '123'
      };

      await request(app)
        .post('/api/auth/register/user')
        .send(userData);
    });

    it('should login user successfully', async () => {
      const loginData = {
        email_usuario: `joao.login.${testTimestamp}@example.com`,
        senha_usuario: '123456'
      };

      const response = await request(app)
        .post('/api/auth/login/user')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      userToken = response.body.data.token;
    });

    it('should reject login with wrong password', async () => {
      const loginData = {
        email_usuario: `joao.login.${testTimestamp}@example.com`,
        senha_usuario: 'senha-errada'
      };

      const response = await request(app)
        .post('/api/auth/login/user')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciais inválidas');
    });

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email_usuario: 'naoexiste@example.com',
        senha_usuario: '123456'
      };

      const response = await request(app)
        .post('/api/auth/login/user')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciais inválidas');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Cria usuário e obtém token
      const userData = {
        nome_usuario: 'João Silva',
        cpf: `${testTimestamp}${Math.floor(Math.random() * 1000)}`,
        telefone_usuario: '(11) 99999-9999',
        email_usuario: `joao.me.${testTimestamp}@example.com`,
        senha_usuario: '123456',
        cep_usuario: '01234-567',
        endereco_usuario: 'Rua Teste, 123',
        numero_usuario: '123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register/user')
        .send(userData);

      
      userToken = registerResponse.body.data.token;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email_usuario).toBe(`joao.me.${testTimestamp}@example.com`);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token não fornecido');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token inválido');
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // Cria usuário e obtém token
      const userData = {
        nome_usuario: 'João Silva',
        cpf: `${testTimestamp}${Math.floor(Math.random() * 1000)}`,
        telefone_usuario: '(11) 99999-9999',
        email_usuario: `joao.logout.${testTimestamp}@example.com`,
        senha_usuario: '123456',
        cep_usuario: '01234-567',
        endereco_usuario: 'Rua Teste, 123',
        numero_usuario: '123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register/user')
        .send(userData);

      
      userToken = registerResponse.body.data.token;
    });

    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout realizado com sucesso');
    });
  });
});