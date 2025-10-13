const request = require('supertest');
const app = require('../app');

describe('Authentication Tests', () => {
  test('POST /api/auth/login/user - should login successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login/user')
      .send({
        email_usuario: 'test@example.com',
        senha_usuario: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login/user - should fail with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login/user')
      .send({
        email_usuario: 'invalid@example.com',
        senha_usuario: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
