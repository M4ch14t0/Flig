/**
 * Teste simples para verificar se o sistema está funcionando
 */

const request = require('supertest');
const app = require('../app');

describe('Teste Simples', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
  });

  it('should register a user with valid data', async () => {
    const userData = {
      nome_usuario: 'Teste Usuario',
      cpf: '11144477735',
      email_usuario: 'teste.simples@example.com',
      senha_usuario: '123456'
    };

    const response = await request(app)
      .post('/api/auth/register/user')
      .send(userData);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    if (response.status === 201) {
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    } else {
      console.log('Registration failed:', response.body);
    }
  });
});
