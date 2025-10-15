# ⚡ Deploy Rápido - Flig MVP

## 🚂 Backend no Railway (15 min)

### 1. Preparar Backend
```bash
cd flig-mvp/backend
```

### 2. Criar railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### 3. Deploy no Railway
1. Acesse [railway.app](https://railway.app)
2. Login com GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecione: `flig-mvp/backend`

### 4. Configurar Variáveis
No Railway → Variables:
```bash
DATABASE_URL=mysql://user:pass@host:port/db
JWT_SECRET=sua-chave-secreta-aqui
CORS_ORIGIN=https://seu-frontend.vercel.app
NODE_ENV=production
```

### 5. Criar Banco MySQL
1. Railway → "New" → "Database" → "MySQL"
2. Copie a `DATABASE_URL`
3. Cole nas variáveis

---

## 🌐 Frontend no Vercel (10 min)

### 1. Preparar Frontend
```bash
cd flig-mvp/frontend
```

### 2. Criar vercel.json
```json
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
  ]
}
```

### 3. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Login com GitHub
3. "New Project" → Import GitHub repo
4. Configure:
   - **Root Directory**: `flig-mvp/frontend`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4. Configurar Variáveis
No Vercel → Settings → Environment Variables:
```bash
VITE_API_URL=https://seu-backend.railway.app
NODE_ENV=production
```

---

## 🔧 Configuração Rápida

### Backend - Variáveis Essenciais
```bash
DATABASE_URL=mysql://user:pass@host:port/db
JWT_SECRET=minha-chave-super-secreta-123
CORS_ORIGIN=https://flig-frontend.vercel.app
NODE_ENV=production
PORT=3000
```

### Frontend - Variáveis Essenciais
```bash
VITE_API_URL=https://flig-backend-production.up.railway.app
NODE_ENV=production
```

---

## 🗄️ Banco de Dados

### 1. Executar SQL
No Railway → Database → Connect:
```sql
-- Execute em ordem:
1. CREATE DATABASE flig;
2. USE flig;
3. -- Cole todo o conteúdo de database/Flig.sql
```

### 2. Verificar Conexão
```bash
# No Railway logs, deve aparecer:
✅ Banco de dados conectado
✅ Servidor rodando na porta 3000
```

---

## ✅ Teste Final

### 1. Backend
```bash
# Teste a URL do Railway
curl https://seu-backend.railway.app/api/health
# Deve retornar: {"status": "OK"}
```

### 2. Frontend
1. Acesse a URL do Vercel
2. Teste login
3. Verifique se carrega dados

### 3. Conectar Frontend → Backend
No frontend, atualize `src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://seu-backend.railway.app';
```

---

## 🚨 Problemas Comuns

### Backend não inicia
- ✅ Verificar se `server.js` existe
- ✅ Verificar se `package.json` tem script "start"
- ✅ Verificar variáveis de ambiente

### Frontend não carrega
- ✅ Verificar se build passou
- ✅ Verificar variáveis de ambiente
- ✅ Verificar se API está acessível

### CORS Error
- ✅ Verificar `CORS_ORIGIN` no backend
- ✅ Verificar se URL do frontend está correta

---

## 📱 URLs Finais

Após o deploy, você terá:
- **Frontend**: `https://flig-frontend.vercel.app`
- **Backend**: `https://flig-backend-production.up.railway.app`

---

## 🎯 Próximos Passos

1. ✅ Testar login/logout
2. ✅ Testar funcionalidades principais
3. ✅ Configurar domínio personalizado (opcional)
4. ✅ Configurar monitoramento
5. ✅ Backup do banco de dados

**🎉 Deploy Concluído!**
