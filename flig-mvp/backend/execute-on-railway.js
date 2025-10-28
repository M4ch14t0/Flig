#!/usr/bin/env node

/**
 * Script para Executar no Railway
 * 
 * Este script executa diretamente no Railway para criar usuário e popular fila
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// Configuração do banco Railway (produção)
const dbConfig = {
  host: 'containers-us-west-201.railway.app',
  user: 'root',
  password: 'Azpx3050@',
  database: 'railway',
  port: 3306,
  charset: 'utf8mb4'
};

async function executeOnRailway() {
  let connection;
  
  try {
    console.log('🚀 EXECUTANDO NO RAILWAY PRODUCTION');
    console.log('===================================');
    console.log('🌐 Host: containers-us-west-201.railway.app');
    console.log('🗄️ Database: railway');
    
    // Conectar ao banco de dados Railway
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados Railway');
    
    // Verificar se o usuário já existe
    console.log('\n🔍 Verificando se usuário testeestab@email.com existe...');
    const [existingUsers] = await connection.execute(
      'SELECT id, nome_empresa, email_empresa FROM estabelecimentos WHERE email_empresa = ?',
      ['testeestab@email.com']
    );
    
    let establishment;
    
    if (existingUsers.length > 0) {
      establishment = existingUsers[0];
      console.log('✅ Usuário já existe:', establishment);
    } else {
      // Criar o usuário
      console.log('\n👤 Criando usuário testeestab@email.com...');
      
      // Criar hash da senha
      const hashedPassword = await bcrypt.hash('Abcd1234', 10);
      
      // Gerar CNPJ de teste
      const cnpj = '12345678000199';
      
      await connection.execute(
        `INSERT INTO estabelecimentos 
         (nome_empresa, cnpj, email_empresa, senha_empresa, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'ativo', NOW(), NOW())`,
        [
          'Estabelecimento Teste',
          cnpj,
          'testeestab@email.com',
          hashedPassword
        ]
      );
      
      // Buscar o usuário criado
      const [newUser] = await connection.execute(
        'SELECT id, nome_empresa, email_empresa FROM estabelecimentos WHERE email_empresa = ?',
        ['testeestab@email.com']
      );
      
      establishment = newUser[0];
      console.log('✅ Usuário criado:', establishment);
    }
    
    // Criar fila de teste
    console.log('\n📋 Criando fila de teste...');
    const queueId = randomUUID();
    
    await connection.execute(
      `INSERT INTO filas 
       (id, nome, estabelecimento_id, descricao, status, max_avancos, valor_avancos, tempo_estimado, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        queueId,
        'Fila Teste Railway Production',
        establishment.id,
        'Fila criada diretamente no Railway',
        'ativa',
        5,
        2.00,
        5
      ]
    );
    
    console.log(`✅ Fila criada com ID: ${queueId}`);
    
    // Dados de clientes
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
    
    // Adicionar clientes
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i];
      const position = i + 1;
      const clientId = `client-${Date.now()}-${i}`;
      
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
    
    // Atualizar estatísticas
    await connection.execute(
      `UPDATE filas 
       SET total_clientes_atendidos = ?, 
           tempo_medio_espera = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [clientes.length, 5, queueId]
    );
    
    console.log('\n📊 RESUMO FINAL');
    console.log('================');
    console.log(`🌐 Servidor: flig-production.up.railway.app`);
    console.log(`🏢 Estabelecimento: ${establishment.nome_empresa} (ID: ${establishment.id})`);
    console.log(`📧 Email: testeestab@email.com`);
    console.log(`🔑 Senha: Abcd1234`);
    console.log(`🆔 ID da Fila: ${queueId}`);
    console.log(`📝 Nome da Fila: Fila Teste Railway Production`);
    console.log(`👥 Total de Clientes: ${clientes.length}`);
    console.log(`📊 Status: ativa`);
    console.log(`💰 Valor por Avanço: R$ 2,00`);
    console.log(`⏱️ Tempo Estimado: 5 min`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS');
    console.log('==================');
    console.log('1. Acesse: https://flig.vercel.app');
    console.log('2. Faça login com: testeestab@email.com / Abcd1234');
    console.log('3. Vá para a seção de filas');
    console.log('4. A fila estará disponível para gerenciamento');
    
    console.log('\n✅ Execução no Railway concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na execução:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão com Railway encerrada');
    }
  }
}

// Executar script
executeOnRailway();
