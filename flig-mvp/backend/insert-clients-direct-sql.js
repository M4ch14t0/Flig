#!/usr/bin/env node

/**
 * Script para Inserir Clientes Diretamente no Banco Railway
 * 
 * Este script insere clientes diretamente no banco de dados
 */

import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco Railway (hardcoded para garantir conexão)
const dbConfig = {
  host: 'containers-us-west-201.railway.app',
  user: 'root',
  password: 'Azpx3050@',
  database: 'railway',
  port: 3306,
  charset: 'utf8mb4'
};

const QUEUE_ID = '43a5a297-e7db-4a25-8c4b-7d7e8d2af104';

async function insertClientsDirectSQL() {
  let connection;
  
  try {
    console.log('🚀 INSERINDO CLIENTES DIRETAMENTE NO BANCO RAILWAY');
    console.log('=================================================');
    console.log(`🌐 Host: ${dbConfig.host}`);
    console.log(`🆔 Queue ID: ${QUEUE_ID}`);
    
    // Conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados Railway');
    
    // Verificar se a fila existe
    console.log('\n🔍 Verificando se a fila existe...');
    const [queueCheck] = await connection.execute(
      'SELECT id, nome, status FROM filas WHERE id = ?',
      [QUEUE_ID]
    );
    
    if (queueCheck.length === 0) {
      console.log('❌ Fila não encontrada!');
      return;
    }
    
    console.log(`✅ Fila encontrada: ${queueCheck[0].nome} (Status: ${queueCheck[0].status})`);
    
    // Dados dos clientes
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
    
    console.log(`\n👥 Inserindo ${clientes.length} clientes na fila...`);
    
    let clientesInseridos = 0;
    
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i];
      const position = i + 1;
      const clientId = `client-${Date.now()}-${i}`;
      
      try {
        // Inserir cliente no histórico da fila
        await connection.execute(
          `INSERT INTO historico_clientes_filas 
           (client_id, queue_id, email_cliente, nome_cliente, telefone_cliente, posicao_inicial, status, data_entrada) 
           VALUES (?, ?, ?, ?, ?, ?, 'aguardando', NOW())`,
          [
            clientId,
            QUEUE_ID,
            cliente.email,
            cliente.nome,
            cliente.telefone,
            position
          ]
        );
        
        console.log(`  ✅ ${cliente.nome} → Posição ${position}`);
        clientesInseridos++;
        
      } catch (error) {
        console.log(`  ❌ Erro ao inserir ${cliente.nome}: ${error.message}`);
      }
    }
    
    // Atualizar estatísticas da fila
    console.log('\n📊 Atualizando estatísticas da fila...');
    await connection.execute(
      `UPDATE filas 
       SET total_clientes_atendidos = ?, 
           tempo_medio_espera = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [clientesInseridos, 5, QUEUE_ID]
    );
    
    console.log('✅ Estatísticas atualizadas');
    
    // Verificar estado final da fila
    console.log('\n🔍 Verificando estado final da fila...');
    const [finalQueue] = await connection.execute(
      'SELECT id, nome, status, total_clientes_atendidos, tempo_medio_espera FROM filas WHERE id = ?',
      [QUEUE_ID]
    );
    
    console.log('📊 Estado da fila:', finalQueue[0]);
    
    // Verificar clientes na fila
    const [clientsInQueue] = await connection.execute(
      'SELECT nome_cliente, email_cliente, posicao_inicial, status FROM historico_clientes_filas WHERE queue_id = ? ORDER BY posicao_inicial',
      [QUEUE_ID]
    );
    
    console.log(`\n👥 Clientes na fila (${clientsInQueue.length}):`);
    clientsInQueue.forEach(client => {
      console.log(`  ${client.posicao_inicial}. ${client.nome_cliente} (${client.email_cliente}) - Status: ${client.status}`);
    });
    
    console.log('\n📊 RESUMO FINAL');
    console.log('================');
    console.log(`🌐 Servidor: ${dbConfig.host}`);
    console.log(`🆔 ID da Fila: ${QUEUE_ID}`);
    console.log(`📝 Nome da Fila: ${finalQueue[0].nome}`);
    console.log(`👥 Clientes inseridos: ${clientesInseridos}`);
    console.log(`📊 Status: ${finalQueue[0].status}`);
    console.log(`⏱️ Tempo Médio: ${finalQueue[0].tempo_medio_espera} min`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    console.log('1. Acesse: https://flig.vercel.app');
    console.log('2. Faça login com: testeestab@email.com / Abcd1234');
    console.log('3. Vá para a seção de filas');
    console.log('4. A fila estará populada com os clientes');
    
    console.log('\n✅ Inserção de clientes concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão com banco encerrada');
    }
  }
}

// Executar script
insertClientsDirectSQL();
