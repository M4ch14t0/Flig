/**
 * Testes de Filas para Sistema Flig
 * 
 * Testa funcionalidades de criação, gerenciamento e operações de filas.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const request = require('supertest');
const app = require('../app');
const connection = require('../config/db');

describe('Queue Tests', () => {
  let establishmentToken;
  let clientToken;
  let queueId;
  let testTimestamp;

  // Gera timestamp único para cada execução de teste
  beforeAll(() => {
    testTimestamp = Date.now();
  });

  // Setup: cria estabelecimento e cliente para testes
  beforeAll(async () => {
    // Cria estabelecimento
    const establishmentData = {
      nome_empresa: 'Estabelecimento Teste',
      cnpj: '12345678000195',
      email_empresa: `estabelecimento.test.${testTimestamp}@example.com`,
      senha_empresa: '123456',
      categoria: 'Restaurante'
    };

    const establishmentResponse = await request(app)
      .post('/api/auth/register/establishment')
      .send(establishmentData);

    establishmentToken = establishmentResponse.body.data.token;

    // Cria cliente
    const clientData = {
      nome_usuario: 'Cliente Teste',
      cpf: '11144477735',
      email_usuario: `cliente.test.${testTimestamp}@example.com`,
      senha_usuario: '123456'
    };

    const clientResponse = await request(app)
      .post('/api/auth/register/user')
      .send(clientData);

    clientToken = clientResponse.body.data.token;
  });

  // Limpa dados de teste após cada teste
  afterEach(async () => {
    if (queueId) {
      await new Promise((resolve, reject) => {
        connection.query('DELETE FROM filas WHERE id = ?', [queueId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  });

  describe('POST /api/queues', () => {
    it('should create a new queue successfully', async () => {
      const queueData = {
        nome: 'Fila de Teste',
        descricao: 'Fila para testes automatizados',
        max_avancos: 5,
        valor_avancos: 2.50,
        tempo_estimado: 10
      };

      const response = await request(app)
        .post('/api/queues')
        .set('Authorization', `Bearer ${establishmentToken}`)
        .send(queueData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.queue).toBeDefined();
      expect(response.body.data.queue.nome).toBe(queueData.nome);
      
      queueId = response.body.data.queue.id;
    });

    it('should reject queue creation without authentication', async () => {
      const queueData = {
        nome: 'Fila de Teste',
        descricao: 'Fila para testes automatizados'
      };

      const response = await request(app)
        .post('/api/queues')
        .send(queueData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token não fornecido');
    });

    it('should reject queue creation by client', async () => {
      const queueData = {
        nome: 'Fila de Teste',
        descricao: 'Fila para testes automatizados'
      };

      const response = await request(app)
        .post('/api/queues')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(queueData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Acesso negado');
    });

    it('should reject queue creation with invalid data', async () => {
      const queueData = {
        nome: '', // Nome vazio
        descricao: 'Fila para testes automatizados'
      };

      const response = await request(app)
        .post('/api/queues')
        .set('Authorization', `Bearer ${establishmentToken}`)
        .send(queueData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dados inválidos');
    });
  });

  describe('GET /api/queues/:queueId', () => {
    beforeEach(async () => {
      // Cria uma fila para os testes
      const queueData = {
        nome: 'Fila para Teste GET',
        descricao: 'Fila para testes de busca',
        max_avancos: 5,
        valor_avancos: 2.50,
        tempo_estimado: 10
      };

      const response = await request(app)
        .post('/api/queues')
        .set('Authorization', `Bearer ${establishmentToken}`)
        .send(queueData);

      queueId = response.body.data.queue.id;
    });

    it('should get queue by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/queues/${queueId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.queue).toBeDefined();
      expect(response.body.data.queue.id).toBe(queueId);
    });

    it('should return 404 for non-existent queue', async () => {
      const fakeQueueId = '550e8400-e29b-41d4-a716-446655440999';
      
      const response = await request(app)
        .get(`/api/queues/${fakeQueueId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Fila não encontrada');
    });
  });

  describe('POST /api/queues/:queueId/join', () => {
    beforeEach(async () => {
      // Cria uma fila para os testes
      const queueData = {
        nome: 'Fila para Teste JOIN',
        descricao: 'Fila para testes de entrada',
        max_avancos: 5,
        valor_avancos: 2.50,
        tempo_estimado: 10
      };

      const response = await request(app)
        .post('/api/queues')
        .set('Authorization', `Bearer ${establishmentToken}`)
        .send(queueData);

      queueId = response.body.data.queue.id;
    });

    it('should join queue successfully', async () => {
      const joinData = {
        nome: 'Cliente Teste',
        telefone: '(11) 99999-9999',
        email: `cliente.join.${testTimestamp}@example.com`
      };

      const response = await request(app)
        .post(`/api/queues/${queueId}/join`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(joinData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.position).toBeDefined();
      expect(response.body.data.clientId).toBeDefined();
    });

    it('should reject join without authentication', async () => {
      const joinData = {
        nome: 'Cliente Teste',
        telefone: '(11) 99999-9999',
        email: `cliente.join.${testTimestamp}@example.com`
      };

      const response = await request(app)
        .post(`/api/queues/${queueId}/join`)
        .send(joinData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token não fornecido');
    });

    it('should reject join by establishment', async () => {
      const joinData = {
        nome: 'Estabelecimento Teste',
        telefone: '(11) 3333-4444',
        email: `estabelecimento.join.${testTimestamp}@example.com`
      };

      const response = await request(app)
        .post(`/api/queues/${queueId}/join`)
        .set('Authorization', `Bearer ${establishmentToken}`)
        .send(joinData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Apenas clientes podem entrar na fila');
    });

    it('should reject join with invalid data', async () => {
      const joinData = {
        nome: '', // Nome vazio
        telefone: '(11) 99999-9999',
        email: `cliente.join.${testTimestamp}@example.com`
      };

      const response = await request(app)
        .post(`/api/queues/${queueId}/join`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(joinData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dados inválidos');
    });
  });

  describe('POST /api/queues/:queueId/advance', () => {
    let clientInQueueId;

    beforeEach(async () => {
      // Cria uma fila para os testes
      const queueData = {
        nome: 'Fila para Teste ADVANCE',
        descricao: 'Fila para testes de avanço',
        max_avancos: 5,
        valor_avancos: 2.50,
        tempo_estimado: 10
      };

      const response = await request(app)
        .post('/api/queues')
        .set('Authorization', `Bearer ${establishmentToken}`)
        .send(queueData);

      queueId = response.body.data.queue.id;

      // Adiciona cliente na fila
      const joinData = {
        nome: 'Cliente para Avanço',
        telefone: '(11) 99999-9999',
        email: `cliente.advance.${testTimestamp}@example.com`
      };

      const joinResponse = await request(app)
        .post(`/api/queues/${queueId}/join`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(joinData);

      clientInQueueId = joinResponse.body.data.clientId;
    });

    it('should advance in queue successfully', async () => {
      const advanceData = {
        positions: 2,
        payment_method: 'credit_card',
        card_data: {
          number: '4111111111111111',
          expiry: '12/25',
          cvv: '123',
          name: 'Cliente Teste'
        }
      };

      const response = await request(app)
        .post(`/api/queues/${queueId}/advance`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(advanceData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.newPosition).toBeDefined();
      expect(response.body.data.transactionId).toBeDefined();
    });

    it('should reject advance without authentication', async () => {
      const advanceData = {
        positions: 2,
        payment_method: 'credit_card'
      };

      const response = await request(app)
        .post(`/api/queues/${queueId}/advance`)
        .send(advanceData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token não fornecido');
    });

    it('should reject advance with invalid positions', async () => {
      const advanceData = {
        positions: 0, // Posições inválidas
        payment_method: 'credit_card'
      };

      const response = await request(app)
        .post(`/api/queues/${queueId}/advance`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(advanceData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Número de posições inválido');
    });
  });

  describe('GET /api/queues/:queueId/clients', () => {
    beforeEach(async () => {
      // Cria uma fila para os testes
      const queueData = {
        nome: 'Fila para Teste CLIENTS',
        descricao: 'Fila para testes de clientes',
        max_avancos: 5,
        valor_avancos: 2.50,
        tempo_estimado: 10
      };

      const response = await request(app)
        .post('/api/queues')
        .set('Authorization', `Bearer ${establishmentToken}`)
        .send(queueData);

      queueId = response.body.data.queue.id;
    });

    it('should get queue clients successfully', async () => {
      // Adiciona um cliente na fila primeiro
      const joinData = {
        nome: 'Cliente para Lista',
        telefone: '(11) 99999-9999',
        email: `cliente.clients.${testTimestamp}@example.com`
      };

      await request(app)
        .post(`/api/queues/${queueId}/join`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(joinData);

      const response = await request(app)
        .get(`/api/queues/${queueId}/clients`)
        .set('Authorization', `Bearer ${establishmentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toBeDefined();
      expect(Array.isArray(response.body.data.clients)).toBe(true);
    });

    it('should return empty clients list for new queue', async () => {
      const response = await request(app)
        .get(`/api/queues/${queueId}/clients`)
        .set('Authorization', `Bearer ${establishmentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toBeDefined();
      expect(response.body.data.clients.length).toBe(0);
    });
  });
});