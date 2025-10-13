#!/bin/bash

echo "🚀 Iniciando deploy do Flig..."

# Parar processos existentes
echo "🛑 Parando processos existentes..."
pkill -f "node server.js" || true
pkill -f "serve" || true
pkill -f "vite" || true

# Build do frontend
echo "📦 Fazendo build do frontend..."
cd frontend
rm -rf dist
rm -rf node_modules/.vite
npm install
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Erro: Build do frontend falhou"
    exit 1
fi

echo "✅ Frontend buildado com sucesso"

# Iniciar servidores
echo "🌐 Iniciando servidores..."

# Frontend (produção)
cd ..
nohup npx serve frontend/dist -l 3000 > frontend.log 2>&1 &
FRONTEND_PID=$!

# Backend
cd backend
nohup MERCADO_PAGO_ACCESS_TOKEN="APP_USR-7477222719242827-100907-b5c7d9ea85eefbe4ef46c5f983df8d3b-2915256254" node server.js > backend.log 2>&1 &
BACKEND_PID=$!

# Aguardar inicialização
sleep 5

# Verificar se os serviços estão rodando
echo "🔍 Verificando serviços..."

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend rodando em http://localhost:3000"
else
    echo "❌ Frontend não está respondendo"
    exit 1
fi

# Backend
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend rodando em http://localhost:5000"
else
    echo "❌ Backend não está respondendo"
    exit 1
fi

echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "🏥 Health: http://localhost:5000/health"
echo ""
echo "📋 Para parar os serviços:"
echo "   pkill -f 'serve' && pkill -f 'node server.js'"
echo ""
echo "📊 Logs:"
echo "   Frontend: tail -f frontend.log"
echo "   Backend: tail -f backend.log"
