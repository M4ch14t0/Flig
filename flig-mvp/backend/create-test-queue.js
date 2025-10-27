/**
 * SCRIPT: Criar fila de teste e povoar com 9 pessoas
 * 
 * Este script cria uma fila de teste no banco de dados e adiciona 9 pessoas
 * para testar a lógica de subdivisões.
 */

import mysql from 'mysql2/promise';
import redisService from './services/redis.js';
import { randomUUID } from 'crypto';

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: '@Azpx3050',
  database: 'flig_db',
  port: 3306
};

// Função para imprimir estado da fila
function printQueueState(title, clients) {
  console.log(`\n=== ${title} ===`);
  console.log('| Pos | Pessoa/Grupo | Subposição | Fila |');
  console.log('| --- | ------------ | ---------- | ---- |');
  
  // Agrupar clientes por posição
  const groupedClients = {};
  clients.forEach(client => {
    const pos = client.position;
    if (!groupedClients[pos]) {
      groupedClients[pos] = [];
    }
    groupedClients[pos].push(client);
  });
  
  // Ordenar posições
  const sortedPositions = Object.keys(groupedClients).sort((a, b) => parseInt(a) - parseInt(b));
  
  sortedPositions.forEach(position => {
    const positionClients = groupedClients[position];
    
    // Ordenar clientes dentro da posição por subposição
    positionClients.sort((a, b) => {
      const subA = a.subPosition || 'a';
      const subB = b.subPosition || 'a';
      return subA.localeCompare(subB);
    });
    
    positionClients.forEach((client, index) => {
      const subPos = client.subPosition || 'a';
      const queueType = client.isSubdivision ? 'Sub' : 'Main';
      console.log(`| ${position} | ${client.nome.padEnd(12)} | - ${position}${subPos} | ${queueType} |`);
    });
  });
}

async function createTestQueue() {
  let connection;
  
  try {
    console.log('🔍 CRIANDO FILA DE TESTE E POVOANDO COM 9 PESSOAS');
    console.log('=================================================');
    
    // Conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados MySQL');
    
    // Buscar estabelecimento por email
    console.log('\n🔍 Buscando estabelecimento por email...');
    const [establishments] = await connection.execute(
      'SELECT id, nome_empresa, email_empresa FROM estabelecimentos WHERE email_empresa = ?',
      ['rafaelmatosoliveira7@gmail.com']
    );
    
    if (establishments.length === 0) {
      throw new Error('❌ Estabelecimento não encontrado com o email fornecido');
    }
    
    const establishment = establishments[0];
    console.log(`✅ Estabelecimento encontrado: ${establishment.nome_empresa} (ID: ${establishment.id})`);
    
    // Criar fila de teste
    console.log('\n📋 Criando fila de teste...');
    const queueId = randomUUID();
    const queueData = {
      nome: 'Fila de Teste - Subdivisões',
      estabelecimento_id: establishment.id,
      descricao: 'Fila criada para testar a lógica de subdivisões',
      status: 'ativa',
      max_avancos: 8,
      valor_avancos: 2.00,
      tempo_estimado: 5
    };
    
    await connection.execute(
      `INSERT INTO filas 
       (id, nome, estabelecimento_id, descricao, status, max_avancos, valor_avancos, tempo_estimado, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        queueId,
        queueData.nome,
        queueData.estabelecimento_id,
        queueData.descricao,
        queueData.status,
        queueData.max_avancos,
        queueData.valor_avancos,
        queueData.tempo_estimado
      ]
    );
    
    console.log(`✅ Fila criada com ID: ${queueId}`);
    
    // Definir metadados da fila no Redis
    await redisService.setQueueMetadata(queueId, {
      nome: queueData.nome,
      estabelecimento_id: queueData.estabelecimento_id,
      descricao: queueData.descricao,
      status: queueData.status,
      max_avancos: queueData.max_avancos,
      valor_avancos: queueData.valor_avancos,
      tempo_estimado: queueData.tempo_estimado,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    console.log('\n👥 Adicionando 9 pessoas à fila...');
    
    // Lista de 9 pessoas para adicionar à fila
    const pessoas = [
      { nome: 'Ana Silva', email: 'ana@test.com', telefone: '111111111' },
      { nome: 'Bruno Santos', email: 'bruno@test.com', telefone: '222222222' },
      { nome: 'Carla Oliveira', email: 'carla@test.com', telefone: '333333333' },
      { nome: 'Diego Costa', email: 'diego@test.com', telefone: '444444444' },
      { nome: 'Elena Ferreira', email: 'elena@test.com', telefone: '555555555' },
      { nome: 'Fernando Lima', email: 'fernando@test.com', telefone: '666666666' },
      { nome: 'Gabriela Souza', email: 'gabriela@test.com', telefone: '777777777' },
      { nome: 'Henrique Alves', email: 'henrique@test.com', telefone: '888888888' },
      { nome: 'Isabela Rocha', email: 'isabela@test.com', telefone: '999999999' }
    ];
    
    // Adicionar cada pessoa à fila
    for (let i = 0; i < pessoas.length; i++) {
      const pessoa = pessoas[i];
      const position = i + 1;
      
      // Adicionar à fila Redis
      await redisService.addClientToQueue(queueId, position, {
        id: `client-${Date.now()}-${i}`,
        nome: pessoa.nome,
        email: pessoa.email,
        telefone: pessoa.telefone,
        timestamp: new Date().toISOString()
      });
      
      // Registrar no histórico do banco
      await connection.execute(
        `INSERT INTO historico_clientes_filas 
         (client_id, queue_id, email_cliente, nome_cliente, telefone_cliente, posicao_inicial, status, data_entrada) 
         VALUES (?, ?, ?, ?, ?, ?, 'aguardando', NOW())`,
        [
          `client-${Date.now()}-${i}`,
          queueId,
          pessoa.email,
          pessoa.nome,
          pessoa.telefone,
          position
        ]
      );
      
      console.log(`✅ ${pessoa.nome} adicionado na posição ${position}`);
    }
    
    // Obter estado final da fila
    const finalClients = await redisService.getQueueClients(queueId);
    printQueueState('ESTADO FINAL — Fila povoada com 9 pessoas', finalClients);
    
    console.log('\n📊 RESUMO DA FILA CRIADA');
    console.log('========================');
    console.log(`🏢 Estabelecimento: ${establishment.nome_empresa}`);
    console.log(`📧 Email: ${establishment.email_empresa}`);
    console.log(`🆔 ID da Fila: ${queueId}`);
    console.log(`📝 Nome da Fila: ${queueData.nome}`);
    console.log(`👥 Total de Pessoas: ${pessoas.length}`);
    console.log(`📊 Status: ${queueData.status}`);
    console.log(`💰 Valor por Avanço: R$ ${queueData.valor_avancos}`);
    console.log(`⏱️ Tempo Estimado: ${queueData.tempo_estimado} min`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS PARA TESTE');
    console.log('==============================');
    console.log('1. Acesse o sistema com o email: rafaelmatosoliveira7@gmail.com');
    console.log('2. Vá para a seção de filas do estabelecimento');
    console.log('3. Encontre a fila "Fila de Teste - Subdivisões"');
    console.log('4. Teste os avanços e chamadas para verificar a lógica de subdivisões');
    
    console.log('\n✅ FILA DE TESTE CRIADA COM SUCESSO!');
    
    return {
      queueId,
      establishment,
      queueData,
      pessoas
    };
    
  } catch (error) {
    console.error('❌ Erro ao criar fila de teste:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão MySQL encerrada');
    }
    
    // Fechar conexão Redis
    const client = await redisService.getRedisClient();
    if (client) {
      await client.quit();
      console.log('🔌 Conexão Redis encerrada');
    }
  }
}

// Executar script
createTestQueue().catch(console.error);
