/**
 * Setup global para testes Jest
 * 
 * Configurações e limpeza necessárias para os testes funcionarem corretamente.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

// Configurar timeout global para testes
jest.setTimeout(30000);

// Suprimir logs durante os testes
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suprimir logs durante os testes
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restaurar logs após os testes
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_NAME = 'flig_db';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '@Azpx3050';

// Limpar dados de teste após cada suite
afterEach(async () => {
  // Aguardar um pouco para garantir que todas as operações assíncronas terminem
  await new Promise(resolve => setTimeout(resolve, 100));
});

