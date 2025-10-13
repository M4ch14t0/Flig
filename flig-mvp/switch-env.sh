#!/bin/bash

# ===========================================
# SCRIPT PARA TROCAR AMBIENTE DE DESENVOLVIMENTO
# ===========================================

FRONTEND_DIR="/home/matoso/Documents/Flig/flig-mvp/frontend"

echo "🔄 Script para trocar ambiente de desenvolvimento"
echo ""

if [ "$1" = "local" ]; then
    echo "🏠 Configurando para DESENVOLVIMENTO LOCAL..."
    cp "$FRONTEND_DIR/.env.local" "$FRONTEND_DIR/.env"
    echo "✅ Configurado para backend local (http://localhost:5000)"
    echo "📝 Certifique-se de que o backend local está rodando:"
    echo "   cd backend && npm start"
    
elif [ "$1" = "production" ]; then
    echo "🚀 Configurando para PRODUÇÃO (RAILWAY)..."
    cp "$FRONTEND_DIR/.env.production" "$FRONTEND_DIR/.env"
    echo "✅ Configurado para backend Railway (https://flig-production.up.railway.app)"
    
else
    echo "❌ Uso: ./switch-env.sh [local|production]"
    echo ""
    echo "Exemplos:"
    echo "  ./switch-env.sh local      # Usar backend local"
    echo "  ./switch-env.sh production # Usar backend Railway"
    echo ""
    echo "Ambiente atual:"
    if [ -f "$FRONTEND_DIR/.env" ]; then
        echo "📄 Arquivo .env atual:"
        cat "$FRONTEND_DIR/.env"
    else
        echo "⚠️  Nenhum arquivo .env encontrado"
    fi
fi

echo ""
echo "🔄 Para aplicar as mudanças, reinicie o servidor frontend:"
echo "   cd frontend && npm run dev"
