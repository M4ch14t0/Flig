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

  // Inicializar API MercadoPago
  // SDK do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
// Adicione credenciais
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-7477222719242827-100907-b5c7d9ea85eefbe4ef46c5f983df8d3b-2915256254' });

 //teste para luisao