#!/usr/bin/env node

/**
 * Script de Configuração para Produção - Sistema Flig
 * 
 * Este script ajuda a configurar o ambiente de produção
 * com variáveis de ambiente seguras e configurações adequadas.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Sistema Flig para Produção...\n');

/**
 * Gera uma string aleatória segura
 * @param {number} length - Tamanho da string
 * @returns {string} - String aleatória
 */
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Gera JWT Secret seguro
 * @returns {string} - JWT Secret
 */
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Gera chave de criptografia
 * @returns {string} - Chave de criptografia
 */
function generateEncryptionKey() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Cria arquivo .env de produção
 */
function createProductionEnv() {
  const envPath = path.join(__dirname, '..', '.env.production');
  const examplePath = path.join(__dirname, '..', 'env.production.example');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env.production já existe!');
    return;
  }
  
  if (!fs.existsSync(examplePath)) {
    console.log('❌ Arquivo env.production.example não encontrado!');
    return;
  }
  
  let envContent = fs.readFileSync(examplePath, 'utf8');
  
  // Substitui valores padrão por valores seguros
  envContent = envContent.replace(
    'JWT_SECRET=super-secret-jwt-key-with-256-bits-minimum-length-for-production-security',
    `JWT_SECRET=${generateJWTSecret()}`
  );
  
  envContent = envContent.replace(
    'ENCRYPTION_KEY=your-32-character-encryption-key-here',
    `ENCRYPTION_KEY=${generateEncryptionKey()}`
  );
  
  envContent = envContent.replace(
    'DB_PASSWORD=secure-database-password-123',
    `DB_PASSWORD=${generateSecureString(16)}`
  );
  
  envContent = envContent.replace(
    'REDIS_PASSWORD=secure-redis-password-456',
    `REDIS_PASSWORD=${generateSecureString(16)}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.production criado com sucesso!');
}

/**
 * Verifica se as dependências estão instaladas
 */
function checkDependencies() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json não encontrado!');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    'express',
    'jsonwebtoken',
    'bcryptjs',
    'mysql2',
    'redis',
    'express-rate-limit',
    'helmet',
    'cors'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log('❌ Dependências faltando:', missingDeps.join(', '));
    console.log('Execute: npm install');
    return false;
  }
  
  console.log('✅ Todas as dependências estão instaladas!');
  return true;
}

/**
 * Cria diretórios necessários
 */
function createDirectories() {
  const dirs = [
    path.join(__dirname, '..', 'logs'),
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'backups')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Diretório criado: ${dir}`);
    }
  });
}

/**
 * Verifica configurações de segurança
 */
function checkSecurityConfig() {
  console.log('\n🔒 Verificando configurações de segurança...');
  
  const checks = [
    {
      name: 'Rate Limiting',
      check: () => {
        const rateLimitPath = path.join(__dirname, '..', 'middleware', 'rateLimiting.js');
        return fs.existsSync(rateLimitPath);
      }
    },
    {
      name: 'Helmet.js',
      check: () => {
        const appPath = path.join(__dirname, '..', 'app.js');
        const content = fs.readFileSync(appPath, 'utf8');
        return content.includes('helmet');
      }
    },
    {
      name: 'CORS Configurado',
      check: () => {
        const appPath = path.join(__dirname, '..', 'app.js');
        const content = fs.readFileSync(appPath, 'utf8');
        return content.includes('cors');
      }
    },
    {
      name: 'Validação de Senhas',
      check: () => {
        const validationPath = path.join(__dirname, '..', 'middleware', 'validation.js');
        const content = fs.readFileSync(validationPath, 'utf8');
        return content.includes('length < 8');
      }
    }
  ];
  
  checks.forEach(check => {
    if (check.check()) {
      console.log(`✅ ${check.name}: OK`);
    } else {
      console.log(`❌ ${check.name}: FALTANDO`);
    }
  });
}

/**
 * Função principal
 */
function main() {
  console.log('🔍 Verificando dependências...');
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  console.log('\n📁 Criando diretórios necessários...');
  createDirectories();
  
  console.log('\n🔧 Criando arquivo de configuração de produção...');
  createProductionEnv();
  
  console.log('\n🔒 Verificando configurações de segurança...');
  checkSecurityConfig();
  
  console.log('\n🎉 Configuração de produção concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente no arquivo .env.production');
  console.log('2. Configure o banco de dados MySQL');
  console.log('3. Configure o Redis');
  console.log('4. Configure as APIs externas (CNPJá, PagSeguro, etc.)');
  console.log('5. Execute: npm start');
  console.log('\n⚠️  IMPORTANTE: Nunca commite o arquivo .env.production!');
}

// Executa o script
if (require.main === module) {
  main();
}

module.exports = {
  generateSecureString,
  generateJWTSecret,
  generateEncryptionKey,
  createProductionEnv,
  checkDependencies,
  createDirectories,
  checkSecurityConfig
};
