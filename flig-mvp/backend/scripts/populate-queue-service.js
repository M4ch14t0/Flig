const redis = require('redis');
const mysql = require('mysql2/promise');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '@Azpx3050',
  database: process.env.DB_NAME || 'flig_db',
  charset: 'utf8mb4'
};

async function populateQueueService() {
  try {
    await redisClient.connect();
    console.log('✅ Redis conectado');

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL conectado');

    // Buscar filas ativas
    const [queues] = await connection.execute(`
      SELECT id, nome, estabelecimento_id 
      FROM filas 
      WHERE status = 'ativa'
    `);

    console.log(`📊 Filas ativas encontradas: ${queues.length}`);

    for (const queue of queues) {
      const queueKey = `flig:queue:${queue.id}`;
      
      // Verificar se a fila já tem clientes
      const existingClients = await redisClient.zCard(queueKey);
      
      if (existingClients === 0) {
        console.log(`📝 Populando fila: ${queue.nome}`);
        
        // Adicionar alguns clientes de exemplo
        const sampleClients = [
          { nome: 'Cliente 1', email: 'cliente1@teste.com', telefone: '11999990001' },
          { nome: 'Cliente 2', email: 'cliente2@teste.com', telefone: '11999990002' },
          { nome: 'Cliente 3', email: 'cliente3@teste.com', telefone: '11999990003' }
        ];

        for (let i = 0; i < sampleClients.length; i++) {
          const client = sampleClients[i];
          const position = i + 1;
          
          const clientData = {
            id: `client-${queue.id}-${i + 1}`,
            ...client,
            timestamp: new Date().toISOString()
          };

          await redisClient.zAdd(queueKey, { 
            score: position, 
            value: JSON.stringify(clientData) 
          });

          console.log(`  ✅ ${client.nome} → Posição ${position}`);
        }
      } else {
        console.log(`⏭️ Fila ${queue.nome} já tem ${existingClients} clientes`);
      }
    }

    await redisClient.disconnect();
    await connection.end();
    console.log('🎉 População de filas concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

populateQueueService();
