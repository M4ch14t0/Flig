// Mock do Redis para desenvolvimento
// Este arquivo substitui o Redis real quando há problemas de conexão

const mockRedis = {
  get: (key) => {
    console.log(`🔍 Redis GET: ${key} (mock)`);
    return Promise.resolve(null);
  },
  set: (key, value) => {
    console.log(`🔍 Redis SET: ${key} = ${value} (mock)`);
    return Promise.resolve('OK');
  },
  del: (key) => {
    console.log(`🔍 Redis DEL: ${key} (mock)`);
    return Promise.resolve(1);
  },
  exists: (key) => {
    console.log(`🔍 Redis EXISTS: ${key} (mock)`);
    return Promise.resolve(0);
  },
  expire: (key, seconds) => {
    console.log(`🔍 Redis EXPIRE: ${key} = ${seconds} (mock)`);
    return Promise.resolve(1);
  },
  on: (event, callback) => {
    console.log(`🔍 Redis ON: ${event} (mock)`);
    if (event === 'connect') {
      setTimeout(() => callback(), 100);
    }
  },
  connect: () => {
    console.log('✅ Redis conectado (mock)');
    return Promise.resolve();
  },
  disconnect: () => {
    console.log('✅ Redis desconectado (mock)');
    return Promise.resolve();
  },
  quit: () => {
    console.log('✅ Redis quit (mock)');
    return Promise.resolve();
  },
  isOpen: true,
  isReady: true
};

module.exports = mockRedis;
