import app from './app.js';
import redisService from './services/redis.js';
import cronService from './services/cronService.js';
import dotenv from 'dotenv';
dotenv.config();

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

  // Inicializar serviço de cron para chamadas automáticas
  try {
    cronService.iniciar(1); // Verificar a cada 1 minuto
    console.log(`🤖 Serviço de chamadas automáticas iniciado`);
  } catch (error) {
    console.error(`❌ Erro ao inicializar serviço de cron:`, error.message);
  }
});