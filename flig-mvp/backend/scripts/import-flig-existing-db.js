const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuração da conexão Railway existente
const dbConfig = {
  host: 'shinkansen.proxy.rlwy.net',
  port: 34823,
  user: 'root',
  password: 'XTtZbdYBcTsBNRqekJDbhdUBVSeFPFho',
  database: 'flig_db',
  charset: 'utf8mb4',
  multipleStatements: true
};

async function importFligExistingDb() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao Railway MySQL existente...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao Railway MySQL existente!');

    // Verificar tabelas existentes
    console.log('📊 Verificando tabelas existentes...');
    const [tables] = await connection.execute('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0]);
    console.log('📋 Tabelas existentes:', existingTables);

    // Verificar dados existentes
    console.log('📊 Verificando dados existentes...');
    
    try {
      const [estabelecimentos] = await connection.execute('SELECT COUNT(*) as total FROM estabelecimentos');
      console.log('🏢 Estabelecimentos existentes:', estabelecimentos[0].total);
    } catch (e) {
      console.log('⚠️ Tabela estabelecimentos não encontrada');
    }

    try {
      const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
      console.log('👥 Usuários existentes:', usuarios[0].total);
    } catch (e) {
      console.log('⚠️ Tabela usuarios não encontrada');
    }

    try {
      const [filas] = await connection.execute('SELECT COUNT(*) as total FROM filas');
      console.log('📋 Filas existentes:', filas[0].total);
    } catch (e) {
      console.log('⚠️ Tabela filas não encontrada');
    }

    try {
      const [planos] = await connection.execute('SELECT COUNT(*) as total FROM planos');
      console.log('💳 Planos existentes:', planos[0].total);
    } catch (e) {
      console.log('⚠️ Tabela planos não encontrada');
    }

    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '../database/Flig.sql');
    console.log('📄 Lendo arquivo SQL:', sqlFilePath);
    
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('📊 Tamanho original:', sqlContent.length, 'caracteres');

    // Limpar o SQL removendo comandos problemáticos
    console.log('🧹 Limpando SQL...');
    
    // Remover CREATE DATABASE e USE
    sqlContent = sqlContent.replace(/CREATE DATABASE.*?;/gi, '');
    sqlContent = sqlContent.replace(/USE `flig_db`;/gi, '');
    
    // Remover comentários de dump
    sqlContent = sqlContent.replace(/-- MySQL dump.*?\n/g, '');
    sqlContent = sqlContent.replace(/-- Host:.*?\n/g, '');
    sqlContent = sqlContent.replace(/-- Server version.*?\n/g, '');
    sqlContent = sqlContent.replace(/-- ------------------------------------------------------.*?\n/g, '');
    
    // Remover configurações de charset problemáticas
    sqlContent = sqlContent.replace(/\/\*!40101 SET @OLD_CHARACTER_SET_CLIENT.*?\*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40101 SET @OLD_CHARACTER_SET_RESULTS.*?\*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40101 SET @OLD_COLLATION_CONNECTION.*?\*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!50503 SET NAMES utf8 \*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40103 SET @OLD_TIME_ZONE.*?\*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40014 SET @OLD_UNIQUE_CHECKS.*?\*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40014 SET @OLD_FOREIGN_KEY_CHECKS.*?\*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40101 SET @OLD_SQL_MODE.*?\*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40111 SET @OLD_SQL_NOTES.*?\*\//g, '');
    
    // Remover restaurações de configurações
    sqlContent = sqlContent.replace(/\/\*!40103 SET TIME_ZONE=@OLD_TIME_ZONE \*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40101 SET SQL_MODE=@OLD_SQL_MODE \*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS \*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS \*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT \*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS \*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION \*\//g, '');
    sqlContent = sqlContent.replace(/\/\*!40111 SET SQL_NOTES=@OLD_SQL_NOTES \*\//g, '');
    
    // Remover comentários de dump completed
    sqlContent = sqlContent.replace(/-- Dump completed on.*?\n/g, '');
    
    // Remover linhas vazias excessivas e pontos e vírgulas soltos
    sqlContent = sqlContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    sqlContent = sqlContent.replace(/;\s*;\s*;/g, ';');
    sqlContent = sqlContent.replace(/^\s*;\s*$/gm, '');
    
    console.log('📊 Tamanho após limpeza:', sqlContent.length, 'caracteres');

    // Executar o SQL limpo
    console.log('🚀 Executando importação do banco completo...');
    console.log('⏳ Isso pode levar alguns minutos...');
    
    await connection.execute(sqlContent);
    
    console.log('✅ Importação do banco completo concluída!');

    // Verificar tabelas após importação
    console.log('📊 Verificando tabelas após importação...');
    const [finalTables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas no banco:', finalTables.map(t => Object.values(t)[0]));

    // Verificar dados após importação
    console.log('📊 Verificando dados após importação...');
    
    try {
      const [estabelecimentos] = await connection.execute('SELECT COUNT(*) as total FROM estabelecimentos');
      console.log('🏢 Estabelecimentos:', estabelecimentos[0].total);
    } catch (e) {
      console.log('⚠️ Tabela estabelecimentos não encontrada ou vazia');
    }

    try {
      const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
      console.log('👥 Usuários:', usuarios[0].total);
    } catch (e) {
      console.log('⚠️ Tabela usuarios não encontrada ou vazia');
    }

    try {
      const [filas] = await connection.execute('SELECT COUNT(*) as total FROM filas');
      console.log('📋 Filas:', filas[0].total);
    } catch (e) {
      console.log('⚠️ Tabela filas não encontrada ou vazia');
    }

    try {
      const [planos] = await connection.execute('SELECT COUNT(*) as total FROM planos');
      console.log('💳 Planos:', planos[0].total);
    } catch (e) {
      console.log('⚠️ Tabela planos não encontrada ou vazia');
    }

    try {
      const [historico] = await connection.execute('SELECT COUNT(*) as total FROM historico_clientes_filas');
      console.log('📈 Histórico:', historico[0].total);
    } catch (e) {
      console.log('⚠️ Tabela historico_clientes_filas não encontrada ou vazia');
    }

    try {
      const [assinaturas] = await connection.execute('SELECT COUNT(*) as total FROM assinaturas');
      console.log('📝 Assinaturas:', assinaturas[0].total);
    } catch (e) {
      console.log('⚠️ Tabela assinaturas não encontrada ou vazia');
    }

    try {
      const [pagamentos] = await connection.execute('SELECT COUNT(*) as total FROM pagamentos');
      console.log('💰 Pagamentos:', pagamentos[0].total);
    } catch (e) {
      console.log('⚠️ Tabela pagamentos não encontrada ou vazia');
    }

    console.log('🎉 Migração completa do banco Railway concluída com sucesso!');
    console.log('🚀 Agora você pode fazer o deploy do backend!');

  } catch (error) {
    console.error('❌ Erro na importação:', error.message);
    console.error('❌ Código do erro:', error.code);
    
    if (error.code === 'ER_TABLE_EXISTS') {
      console.log('⚠️ Algumas tabelas já existem, continuando...');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ Alguns dados já existem, continuando...');
    } else {
      console.error('❌ Erro crítico:', error);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

importFligExistingDb();




