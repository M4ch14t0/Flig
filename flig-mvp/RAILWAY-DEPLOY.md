# 🚂 RAILWAY DEPLOYMENT GUIDE - FLIG MVP

## 📋 **PRÉ-REQUISITOS**

1. **Conta no Railway**: [railway.app](https://railway.app)
2. **GitHub Repository**: Projeto deve estar no GitHub
3. **Variáveis de Ambiente**: Configuradas no Railway

## 🚀 **DEPLOY DO BACKEND**

### 1. **Criar Novo Projeto no Railway**
```bash
# Instalar Railway CLI (opcional)
npm install -g @railway/cli

# Login no Railway
railway login

# Conectar ao projeto
railway link
```

### 2. **Configurar Variáveis de Ambiente no Railway**
Acesse: **Project Settings > Variables**

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (Railway MySQL)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-production
JWT_EXPIRES_IN=24h

# Encryption Key
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Redis Configuration (Railway Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# External APIs
CNPJA_TOKEN=your-cnpja-api-token-here
VIACEP_API_URL=https://viacep.com.br/ws

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.railway.app
```

### 3. **Adicionar Serviços**
- **MySQL Database**: Adicionar serviço MySQL
- **Redis**: Adicionar serviço Redis

### 4. **Deploy**
```bash
# Deploy automático via GitHub
git push origin main
```

## 🎨 **DEPLOY DO FRONTEND**

### 1. **Criar Novo Projeto no Railway**
- Conectar repositório GitHub
- Selecionar pasta `frontend/`

### 2. **Configurar Variáveis de Ambiente**
```env
# API Configuration
VITE_API_URL=https://your-backend-domain.railway.app/api
VITE_BACKEND_URL=https://your-backend-domain.railway.app

# App Configuration
VITE_APP_NAME=Flig
VITE_APP_VERSION=1.0.0
```

### 3. **Deploy**
```bash
# Deploy automático via GitHub
git push origin main
```

## 🔧 **CONFIGURAÇÕES IMPORTANTES**

### **Backend**
- **Start Command**: `npm start`
- **Health Check**: `/health`
- **Port**: Railway define automaticamente

### **Frontend**
- **Start Command**: `npm run build && npm start`
- **Health Check**: `/`
- **Port**: Railway define automaticamente

## 📊 **MONITORAMENTO**

### **Logs**
- Acesse: **Project > Deployments > Logs**
- Monitore erros e performance

### **Métricas**
- CPU, Memory, Network
- Response times
- Error rates

## 🔒 **SEGURANÇA**

### **Variáveis Sensíveis**
- ✅ Nunca commitar `.env` files
- ✅ Usar Railway Variables
- ✅ Rotacionar JWT_SECRET em produção
- ✅ Usar HTTPS (Railway fornece automaticamente)

### **Rate Limiting**
- ✅ Configurado no backend
- ✅ 100 req/5min (geral)
- ✅ 5 req/5min (auth)

## 🚨 **TROUBLESHOOTING**

### **Backend não inicia**
1. Verificar variáveis de ambiente
2. Verificar conexão com MySQL/Redis
3. Verificar logs no Railway

### **Frontend não carrega**
1. Verificar `VITE_API_URL`
2. Verificar CORS no backend
3. Verificar build do Vite

### **Database Connection Error**
1. Verificar variáveis MySQL
2. Verificar se database existe
3. Executar migrations se necessário

## 📝 **CHECKLIST DE DEPLOY**

### **Backend**
- [ ] Variáveis de ambiente configuradas
- [ ] MySQL service adicionado
- [ ] Redis service adicionado
- [ ] Health check funcionando
- [ ] Logs sem erros

### **Frontend**
- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando
- [ ] API URL correta
- [ ] CORS configurado

### **Geral**
- [ ] Domínios configurados
- [ ] HTTPS funcionando
- [ ] Testes de funcionalidade
- [ ] Monitoramento ativo

## 🎯 **PRÓXIMOS PASSOS**

1. **Configurar domínios customizados** (opcional)
2. **Configurar CI/CD** (opcional)
3. **Configurar backup automático** do banco
4. **Configurar alertas** de monitoramento
5. **Otimizar performance** conforme necessário

---

**🚀 Seu Flig MVP estará online no Railway!**
