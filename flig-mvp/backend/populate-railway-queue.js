#!/usr/bin/env node

/**
 * Script para Popular Fila no Railway
 * 
 * Este script conecta ao banco Railway e popula uma fila com dados de teste
 */

import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do banco Railway
const dbConfig = {
  host: process.env.DB_HOST || 'containers-us-west-201.railway.app',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Azpx3050@',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
};

// Configuração do Redis (se necessário)
const redisConfig = {
  host: process.env.REDIS_HOST || 'containers-us-west-201.railway.app',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || 'Azpx3050@'
};

async function populateRailwayQueue() {
  let connection;
  
  try {
    console.log('🚀 POPULANDO FILA NO RAILWAY');
    console.log('============================');
    
    // Conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados Railway');
    
    // Buscar estabelecimento ativo
    console.log('\n🔍 Buscando estabelecimento ativo...');
    const [establishments] = await connection.execute(
      'SELECT id, nome_empresa, email_empresa FROM estabelecimentos WHERE status = "ativo" LIMIT 1'
    );
    
    if (establishments.length === 0) {
      console.log('❌ Nenhum estabelecimento ativo encontrado');
      console.log('📝 Criando estabelecimento de teste...');
      
      // Criar estabelecimento de teste
      const establishmentId = randomUUID();
      await connection.execute(
        `INSERT INTO estabelecimentos 
         (id, nome_empresa, email_empresa, senha_empresa, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'ativo', NOW(), NOW())`,
        [
          establishmentId,
          'Estabelecimento Teste',
          'teste@estabelecimento.com',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // senha: password
        ]
      );
      
      console.log(`✅ Estabelecimento criado: ${establishmentId}`);
    } else {
      console.log(`✅ Estabelecimento encontrado: ${establishments[0].nome_empresa} (ID: ${establishments[0].id})`);
    }
    
    const establishment = establishments[0] || { id: establishmentId, nome_empresa: 'Estabelecimento Teste' };
    
    // Criar fila de teste
    console.log('\n📋 Criando fila de teste...');
    const queueId = randomUUID();
    const queueData = {
      nome: 'Fila Teste Railway',
      estabelecimento_id: establishment.id,
      descricao: 'Fila criada para teste no Railway',
      status: 'ativa',
      max_avancos: 5,
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
    
    // Dados de clientes para popular a fila
    const clientes = [
      { nome: 'João Silva', email: 'joao@teste.com', telefone: '11999990001' },
      { nome: 'Maria Santos', email: 'maria@teste.com', telefone: '11999990002' },
      { nome: 'Pedro Oliveira', email: 'pedro@teste.com', telefone: '11999990003' },
      { nome: 'Ana Costa', email: 'ana@teste.com', telefone: '11999990004' },
      { nome: 'Carlos Lima', email: 'carlos@teste.com', telefone: '11999990005' },
      { nome: 'Fernanda Souza', email: 'fernanda@teste.com', telefone: '11999990006' },
      { nome: 'Rafael Pereira', email: 'rafael@teste.com', telefone: '11999990007' },
      { nome: 'Juliana Alves', email: 'juliana@teste.com', telefone: '11999990008' },
      { nome: 'Lucas Ferreira', email: 'lucas@teste.com', telefone: '11999990009' },
      { nome: 'Camila Rodrigues', email: 'camila@teste.com', telefone: '11999990010' }
    ];
    
    console.log(`\n👥 Adicionando ${clientes.length} clientes à fila...`);
    
    // Adicionar cada cliente à fila
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i];
      const position = i + 1;
      const clientId = `client-${Date.now()}-${i}`;
      
      // Registrar no histórico do banco
      await connection.execute(
        `INSERT INTO historico_clientes_filas 
         (client_id, queue_id, email_cliente, nome_cliente, telefone_cliente, posicao_inicial, status, data_entrada) 
         VALUES (?, ?, ?, ?, ?, ?, 'aguardando', NOW())`,
        [
          clientId,
          queueId,
          cliente.email,
          cliente.nome,
          cliente.telefone,
          position
        ]
      );
      
      console.log(`  ✅ ${cliente.nome} → Posição ${position}`);
    }
    
    // Atualizar estatísticas da fila
    await connection.execute(
      `UPDATE filas 
       SET total_clientes = ?, 
           tempo_medio_espera = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [clientes.length, queueData.tempo_estimado, queueId]
    );
    
    console.log('\n📊 RESUMO DA FILA CRIADA');
    console.log('========================');
    console.log(`🏢 Estabelecimento: ${establishment.nome_empresa}`);
    console.log(`🆔 ID da Fila: ${queueId}`);
    console.log(`📝 Nome da Fila: ${queueData.nome}`);
    console.log(`👥 Total de Clientes: ${clientes.length}`);
    console.log(`📊 Status: ${queueData.status}`);
    console.log(`💰 Valor por Avanço: R$ ${queueData.valor_avancos}`);
    console.log(`⏱️ Tempo Estimado: ${queueData.tempo_estimado} min`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    console.log('1. Acesse o sistema com o email do estabelecimento');
    console.log('2. Vá para a seção de filas');
    console.log('3. A fila estará disponível para gerenciamento');
    console.log(`4. ID da Fila para testes: ${queueId}`);
    
    console.log('\n✅ População da fila concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao popular fila:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão com banco encerrada');
    }
  }
}

// Executar script
populateRailwayQueue();
