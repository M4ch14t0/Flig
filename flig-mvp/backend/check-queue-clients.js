import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'containers-us-west-201.railway.app',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Azpx3050@',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
};

async function checkQueueClients() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('🔍 Verificando clientes na fila criada...');
  
  // Buscar a fila criada
  const [filas] = await connection.execute(
    "SELECT id, nome, status FROM filas WHERE nome = 'Fila Teste Railway' ORDER BY created_at DESC LIMIT 1"
  );
  
  if (filas.length === 0) {
    console.log('❌ Fila não encontrada');
    return;
  }
  
  const fila = filas[0];
  console.log(`✅ Fila encontrada: ${fila.nome} (${fila.id})`);
  
  // Buscar clientes na fila
  const [clientes] = await connection.execute(
    'SELECT client_id, nome_cliente, email_cliente, telefone_cliente, posicao_inicial, status, data_entrada FROM historico_clientes_filas WHERE queue_id = ? ORDER BY posicao_inicial',
    [fila.id]
  );
  
  console.log(`\n👥 Clientes na fila (${clientes.length}):`);
  clientes.forEach(cliente => {
    console.log(`  ${cliente.posicao_inicial}. ${cliente.nome_cliente} (${cliente.email_cliente}) - Status: ${cliente.status}`);
  });
  
  // Atualizar estatísticas da fila
  console.log('\n📊 Atualizando estatísticas da fila...');
  await connection.execute(
    `UPDATE filas 
     SET total_clientes_atendidos = ?, 
         tempo_medio_espera = ?,
         updated_at = NOW()
     WHERE id = ?`,
    [clientes.length, 5, fila.id]
  );
  
  console.log('✅ Estatísticas atualizadas');
  
  // Verificar filas ativas
  console.log('\n🔍 Todas as filas ativas:');
  const [filasAtivas] = await connection.execute(
    'SELECT id, nome, status, created_at FROM filas WHERE status = "ativa" ORDER BY created_at DESC'
  );
  
  filasAtivas.forEach(fila => {
    console.log(`- ${fila.nome} (${fila.id}) - Criada: ${fila.created_at}`);
  });
  
  await connection.end();
}

checkQueueClients().catch(console.error);
