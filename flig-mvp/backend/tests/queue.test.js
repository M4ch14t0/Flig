const request = require('supertest');
const app = require('../app');

describe('Queue Tests', () => {
  let authToken;
  let queueId;

  beforeAll(async () => {
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login/establishment')
      .send({
        email_empresa: 'test@example.com',
        senha_empresa: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  test('POST /api/queues - should create queue', async () => {
    const response = await request(app)
      .post('/api/queues')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nome: 'Test Queue',
        descricao: 'Test Description',
        tempo_estimado: 5
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    queueId = response.body.data.id;
  });

  test('GET /api/queues - should list queues', async () => {
    const response = await request(app)
      .get('/api/queues')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
