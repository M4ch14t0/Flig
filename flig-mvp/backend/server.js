const app = require('./app');
const redisService = require('./services/redis');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Inicialização do servidor
app.listen(PORT, async () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`🏥 Health check disponível em http://localhost:${PORT}/health`);
  console.log(`📋 Rotas de filas disponíveis em http://localhost:${PORT}/api/queues`);
  
  // Inicializar conexão com Redis
  try {
    await redisService.connectRedis();
    console.log(`✅ Sistema de filas inicializado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao inicializar Redis:`, error.message);
    console.log(`⚠️  Sistema funcionará sem filas até Redis estar disponível`);
  }
});