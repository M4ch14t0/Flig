#!/bin/bash

# 🚀 Script de Deploy Automatizado - Flig MVP
# Este script prepara o projeto para deploy no Railway e Vercel

echo "🚀 Iniciando preparação para deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -d "flig-mvp" ]; then
    print_error "Diretório flig-mvp não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

print_status "Verificando estrutura do projeto..."

# Verificar backend
if [ ! -f "flig-mvp/backend/package.json" ]; then
    print_error "package.json do backend não encontrado!"
    exit 1
fi

# Verificar frontend
if [ ! -f "flig-mvp/frontend/package.json" ]; then
    print_error "package.json do frontend não encontrado!"
    exit 1
fi

print_success "Estrutura do projeto verificada!"

# Preparar backend
print_status "Preparando backend..."

cd flig-mvp/backend

# Verificar se railway.json existe
if [ ! -f "railway.json" ]; then
    print_status "Criando railway.json..."
    cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
    print_success "railway.json criado!"
fi

# Verificar se server.js existe
if [ ! -f "server.js" ]; then
    print_warning "server.js não encontrado. Verifique se o arquivo principal está correto."
fi

# Verificar dependências
print_status "Verificando dependências do backend..."
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependências do backend..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependências do backend instaladas!"
    else
        print_error "Erro ao instalar dependências do backend!"
        exit 1
    fi
fi

cd ../..

# Preparar frontend
print_status "Preparando frontend..."

cd flig-mvp/frontend

# Verificar se vercel.json existe
if [ ! -f "vercel.json" ]; then
    print_status "Criando vercel.json..."
    cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
    print_success "vercel.json criado!"
fi

# Verificar dependências
print_status "Verificando dependências do frontend..."
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependências do frontend..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependências do frontend instaladas!"
    else
        print_error "Erro ao instalar dependências do frontend!"
        exit 1
    fi
fi

# Testar build do frontend
print_status "Testando build do frontend..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build do frontend realizado com sucesso!"
else
    print_error "Erro no build do frontend!"
    exit 1
fi

cd ../..

print_success "🎉 Preparação concluída com sucesso!"

echo ""
echo "📋 Próximos passos:"
echo ""
echo "🚂 BACKEND (Railway):"
echo "1. Acesse https://railway.app"
echo "2. Login com GitHub"
echo "3. 'New Project' → 'Deploy from GitHub repo'"
echo "4. Selecione: flig-mvp/backend"
echo "5. Configure as variáveis de ambiente:"
echo "   - DATABASE_URL (criar MySQL no Railway)"
echo "   - JWT_SECRET=sua-chave-secreta"
echo "   - CORS_ORIGIN=https://seu-frontend.vercel.app"
echo "   - NODE_ENV=production"
echo ""
echo "🌐 FRONTEND (Vercel):"
echo "1. Acesse https://vercel.com"
echo "2. Login com GitHub"
echo "3. 'New Project' → Import GitHub repo"
echo "4. Configure:"
echo "   - Root Directory: flig-mvp/frontend"
echo "   - Framework: Vite"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "5. Configure variáveis:"
echo "   - VITE_API_URL=https://seu-backend.railway.app"
echo "   - NODE_ENV=production"
echo ""
echo "📚 Guias completos criados:"
echo "- DEPLOY-GUIDE-COMPLETO.md"
echo "- DEPLOY-GUIDE-RAPIDO.md"
echo ""
print_success "🚀 Pronto para deploy!"
