#!/usr/bin/env node

/**
 * Script para Criar Usuário de Teste no Railway (Corrigido)
 * 
 * Este script cria o usuário testeestab@email.com no Railway com todos os campos obrigatórios
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
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

async function createTestUser() {
  let connection;
  
  try {
    console.log('🚀 CRIANDO USUÁRIO DE TESTE NO RAILWAY (CORRIGIDO)');
    console.log('=================================================');
    
    // Conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados Railway');
    
    // Verificar se o usuário já existe
    console.log('\n🔍 Verificando se usuário já existe...');
    const [existingUsers] = await connection.execute(
      'SELECT id, nome_empresa, email_empresa FROM estabelecimentos WHERE email_empresa = ?',
      ['testeestab@email.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('✅ Usuário já existe:', existingUsers[0]);
      return existingUsers[0];
    }
    
    // Criar hash da senha
    console.log('\n🔐 Criando hash da senha...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Abcd1234', saltRounds);
    console.log('✅ Hash da senha criado');
    
    // Gerar CNPJ de teste
    const cnpj = '12345678000199'; // CNPJ de teste
    
    // Criar o usuário com todos os campos obrigatórios
    console.log('\n👤 Criando usuário testeestab@email.com...');
    
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
    
    console.log(`✅ Usuário criado com CNPJ: ${cnpj}`);
    
    // Verificar se foi criado
    const [newUser] = await connection.execute(
      'SELECT id, nome_empresa, email_empresa, cnpj, status FROM estabelecimentos WHERE email_empresa = ?',
      ['testeestab@email.com']
    );
    
    console.log('\n📊 USUÁRIO CRIADO:');
    console.log('==================');
    console.log(`🆔 ID: ${newUser[0].id}`);
    console.log(`🏢 Nome: ${newUser[0].nome_empresa}`);
    console.log(`📧 Email: ${newUser[0].email_empresa}`);
    console.log(`🏛️ CNPJ: ${newUser[0].cnpj}`);
    console.log(`📊 Status: ${newUser[0].status}`);
    console.log(`🔑 Senha: Abcd1234`);
    
    console.log('\n✅ Usuário criado com sucesso!');
    return newUser[0];
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão com banco encerrada');
    }
  }
}

// Executar script
createTestUser();
