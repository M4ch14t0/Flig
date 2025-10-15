# 🚀 Guia Completo de Deploy - Flig MVP

Este guia contém instruções detalhadas para fazer o deploy do backend no Railway e do frontend no Vercel.

## 📋 Índice
1. [Deploy do Backend no Railway](#backend-railway)
2. [Deploy do Frontend no Vercel](#frontend-vercel)
3. [Configuração do Banco de Dados](#database-setup)
4. [Variáveis de Ambiente](#environment-variables)
5. [Testes Pós-Deploy](#post-deploy-tests)
6. [Troubleshooting](#troubleshooting)

---

## 🚂 Backend - Railway Deploy

### 1. Preparação do Projeto

#### 1.1 Estrutura de Arquivos
Certifique-se de que o backend tenha a seguinte estrutura:
```
flig-mvp/backend/
├── app.js
├── server.js
├── package.json
├── railway.json
├── config/
│   ├── database.js
│   └── db.js
├── controllers/
├── models/
├── routes/
├── services/
└── middleware/
```

#### 1.2 Configuração do package.json
```json
{
  "name": "flig-backend",
  "version": "1.0.0",
  "description": "Backend API para Flig MVP",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.4",
    "redis": "^4.6.7",
    "node-cron": "^3.0.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 1.3 Configuração do railway.json
```json
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
```

### 2. Deploy no Railway

#### 2.1 Criar Conta no Railway
1. Acesse [railway.app](https://railway.app)
2. Clique em "Login" e faça login com GitHub
3. Autorize o Railway a acessar seus repositórios

#### 2.2 Conectar Repositório
1. No dashboard do Railway, clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha o repositório do Flig
4. Selecione a pasta `flig-mvp/backend`

#### 2.3 Configurar Variáveis de Ambiente
No Railway, vá em "Variables" e adicione:

```bash
# Banco de Dados
DATABASE_URL=mysql://username:password@host:port/database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Redis
REDIS_URL=redis://username:password@host:port

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Ambiente
NODE_ENV=production
PORT=3000
```

#### 2.4 Configurar Domínio
1. No Railway, vá em "Settings" > "Domains"
2. Clique em "Generate Domain"
3. Anote a URL gerada (ex: `https://flig-backend-production.up.railway.app`)

### 3. Configuração do Banco de Dados

#### 3.1 Usar Railway MySQL
1. No Railway, clique em "New" > "Database" > "MySQL"
2. Aguarde a criação do banco
3. Copie a `DATABASE_URL` gerada
4. Cole nas variáveis de ambiente

#### 3.2 Executar Migrações
```bash
# Conectar ao banco via Railway CLI
railway connect

# Executar scripts SQL
mysql -h host -u user -p database < database/Flig.sql
```

---

## 🌐 Frontend - Vercel Deploy

### 1. Preparação do Projeto

#### 1.1 Estrutura de Arquivos
```
flig-mvp/frontend/
├── package.json
├── vercel.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   ├── services/
│   └── styles/
└── public/
```

#### 1.2 Configuração do package.json
```json
{
  "name": "flig-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "axios": "^1.5.0",
    "recharts": "^2.8.0",
    "react-icons": "^4.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}
```

#### 1.3 Configuração do vercel.json
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
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 1.4 Configuração do vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    port: 3000,
    host: true
  }
})
```

### 2. Deploy no Vercel

#### 2.1 Criar Conta no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up" e faça login com GitHub
3. Autorize o Vercel a acessar seus repositórios

#### 2.2 Conectar Repositório
1. No dashboard do Vercel, clique em "New Project"
2. Importe o repositório do GitHub
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `flig-mvp/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 2.3 Configurar Variáveis de Ambiente
No Vercel, vá em "Settings" > "Environment Variables":

```bash
# API Backend
VITE_API_URL=https://flig-backend-production.up.railway.app

# Ambiente
NODE_ENV=production
VITE_NODE_ENV=production
```

#### 2.4 Configurar Domínio
1. No Vercel, vá em "Settings" > "Domains"
2. Adicione seu domínio personalizado (opcional)
3. Anote a URL gerada (ex: `https://flig-frontend.vercel.app`)

---

## 🔧 Configuração de Variáveis de Ambiente

### Backend (Railway)
```bash
# Banco de Dados
DATABASE_URL=mysql://user:pass@host:port/db
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=xxx
DB_NAME=railway
DB_PORT=3306

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Redis
REDIS_URL=redis://default:xxx@containers-us-west-xxx.railway.app:6379

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# CORS
CORS_ORIGIN=https://flig-frontend.vercel.app

# Ambiente
NODE_ENV=production
PORT=3000
```

### Frontend (Vercel)
```bash
# API
VITE_API_URL=https://flig-backend-production.up.railway.app

# Ambiente
NODE_ENV=production
VITE_NODE_ENV=production
```

---

## 🗄️ Configuração do Banco de Dados

### 1. Usar Railway MySQL
1. No Railway, crie um novo banco MySQL
2. Copie a `DATABASE_URL` gerada
3. Configure no backend

### 2. Executar Scripts SQL
```sql
-- Execute os scripts em ordem:
1. database/Flig.sql (estrutura principal)
2. database/create_sessions_table.sql
3. database/create_plans_tables.sql
4. database/add_auto_call_fields.sql
5. database/add_tempo_espera_fields.sql
```

### 3. Verificar Conexão
```javascript
// Teste no backend
const connection = require('./config/db');
connection.query('SELECT 1', (err, results) => {
  if (err) console.error('❌ Erro de conexão:', err);
  else console.log('✅ Banco conectado!');
});
```

---

## 🧪 Testes Pós-Deploy

### 1. Testar Backend
```bash
# Health Check
curl https://flig-backend-production.up.railway.app/api/health

# Testar autenticação
curl -X POST https://flig-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","userType":"estabelecimento"}'
```

### 2. Testar Frontend
1. Acesse a URL do Vercel
2. Teste login/logout
3. Verifique se as chamadas para API funcionam
4. Teste funcionalidades principais

### 3. Verificar Logs
- **Railway**: Dashboard > Deployments > Logs
- **Vercel**: Dashboard > Functions > Logs

---

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Backend não inicia
```bash
# Verificar logs no Railway
# Verificar se todas as variáveis estão configuradas
# Verificar se o banco está acessível
```

#### 2. Frontend não carrega
```bash
# Verificar build no Vercel
# Verificar variáveis de ambiente
# Verificar se a API está acessível
```

#### 3. CORS Errors
```javascript
// No backend, verificar:
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://flig-frontend.vercel.app',
  credentials: true
}));
```

#### 4. Banco de Dados não conecta
```bash
# Verificar DATABASE_URL
# Verificar se o banco está ativo no Railway
# Verificar firewall/portas
```

### Comandos Úteis

#### Railway CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Ver logs
railway logs

# Conectar ao banco
railway connect
```

#### Vercel CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Ver logs
vercel logs
```

---

## 📞 Suporte

### Links Úteis
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### Contatos
- Railway Support: [support@railway.app](mailto:support@railway.app)
- Vercel Support: [help@vercel.com](mailto:help@vercel.com)

---

## ✅ Checklist Final

### Backend (Railway)
- [ ] Projeto conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e conectado
- [ ] Scripts SQL executados
- [ ] Health check funcionando
- [ ] Domínio configurado

### Frontend (Vercel)
- [ ] Projeto conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando
- [ ] API conectada
- [ ] Domínio configurado

### Testes
- [ ] Login/logout funcionando
- [ ] API respondendo
- [ ] Banco de dados conectado
- [ ] CORS configurado
- [ ] Deploy em produção funcionando

---

**🎉 Parabéns! Seu deploy está completo!**

Agora você tem:
- ✅ Backend rodando no Railway
- ✅ Frontend rodando no Vercel
- ✅ Banco de dados configurado
- ✅ Domínios funcionando
- ✅ Aplicação em produção

**URLs de Produção:**
- Frontend: `https://flig-frontend.vercel.app`
- Backend: `https://flig-backend-production.up.railway.app`