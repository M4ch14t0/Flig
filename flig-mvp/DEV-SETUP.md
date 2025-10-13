# 🛠️ CONFIGURAÇÃO DE DESENVOLVIMENTO - FLIG MVP

## 🚀 **CONFIGURAÇÃO RÁPIDA**

### **1. Backend Local**
```bash
# Navegar para o backend
cd backend

# Instalar dependências (se necessário)
npm install

# Iniciar servidor local
npm start
# ✅ Backend rodando em http://localhost:5000
```

### **2. Frontend Local**
```bash
# Navegar para o frontend
cd frontend

# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
# ✅ Frontend rodando em http://localhost:3001
```

## 🔄 **TROCAR ENTRE AMBIENTES**

### **Usar Backend Local (Desenvolvimento)**
```bash
# Usar script automático
./switch-env.sh local

# OU manualmente
cp frontend/.env.local frontend/.env
```

### **Usar Backend Railway (Produção)**
```bash
# Usar script automático
./switch-env.sh production

# OU manualmente
cp frontend/.env.production frontend/.env
```

## 📋 **CONFIGURAÇÕES DE AMBIENTE**

### **Desenvolvimento Local (.env.local)**
```env
VITE_API_URL=http://localhost:5000
VITE_DEV_MODE=true
VITE_DEBUG=true
```

### **Produção Railway (.env.production)**
```env
VITE_API_URL=https://flig-production.up.railway.app
VITE_DEV_MODE=false
VITE_DEBUG=false
```

## 🔧 **COMANDOS ÚTEIS**

### **Verificar Status dos Serviços**
```bash
# Verificar se backend está rodando
curl http://localhost:5000/health

# Verificar se frontend está rodando
curl http://localhost:3001
```

### **Parar Processos**
```bash
# Parar backend (porta 5000)
lsof -ti:5000 | xargs kill -9

# Parar frontend (porta 3001)
lsof -ti:3001 | xargs kill -9
```

### **Logs e Debug**
```bash
# Ver logs do backend
cd backend && npm start

# Ver logs do frontend
cd frontend && npm run dev
```

## 🐛 **TROUBLESHOOTING**

### **Erro: Porta 5000 em uso**
```bash
# Encontrar e parar processo
lsof -ti:5000 | xargs kill -9
```

### **Erro: Porta 3000/3001 em uso**
```bash
# Encontrar e parar processo
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### **Frontend não conecta com backend**
1. Verificar se backend está rodando: `curl http://localhost:5000/health`
2. Verificar arquivo `.env` no frontend
3. Reiniciar servidor frontend: `npm run dev`

### **Erro 404 no registro**
1. Verificar se URL está correta no `.env`
2. Verificar se backend tem a rota `/api/auth/register/user`
3. Testar endpoint diretamente: `curl -X POST http://localhost:5000/api/auth/register/user`

## 📁 **ESTRUTURA DE ARQUIVOS**

```
flig-mvp/
├── backend/                 # Backend Node.js
│   ├── server.js           # Servidor principal
│   ├── app.js              # Configuração Express
│   └── routes/             # Rotas da API
├── frontend/               # Frontend React/Vite
│   ├── src/                # Código fonte
│   ├── .env                # Configuração atual
│   ├── .env.local          # Configuração local
│   └── .env.production     # Configuração produção
├── switch-env.sh           # Script para trocar ambiente
└── DEV-SETUP.md           # Este arquivo
```

## 🎯 **FLUXO DE DESENVOLVIMENTO**

1. **Iniciar Backend Local**
   ```bash
   cd backend && npm start
   ```

2. **Configurar Frontend para Local**
   ```bash
   ./switch-env.sh local
   ```

3. **Iniciar Frontend**
   ```bash
   cd frontend && npm run dev
   ```

4. **Desenvolver e Testar**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5000/api

5. **Para Produção**
   ```bash
   ./switch-env.sh production
   ```

## ✅ **CHECKLIST DE DESENVOLVIMENTO**

- [ ] Backend local rodando (porta 5000)
- [ ] Frontend configurado para local
- [ ] Frontend rodando (porta 3001)
- [ ] Teste de conexão funcionando
- [ ] Registro de usuário funcionando
- [ ] Login funcionando

---

**🚀 Pronto para desenvolver!**
