# 🚀 Guia de Deploy - Flig MVP

## 📋 **ESTRATÉGIA DE DEPLOY:**
- **Backend**: Railway (Node.js + MySQL + Redis)
- **Frontend**: Vercel (React + Vite)

---

## 🚂 **1. DEPLOY BACKEND NO RAILWAY**

### **Passo 1: Preparar o Backend**
```bash
cd flig-mvp/backend
npm install
```

### **Passo 2: Configurar Variáveis de Ambiente no Railway**
No painel do Railway, adicione estas variáveis:

```env
NODE_ENV=production
PORT=5000

# Banco de Dados (Railway MySQL)
DB_HOST=seu-mysql-host.railway.app
DB_USER=root
DB_PASSWORD=sua-senha-mysql
DB_NAME=railway
DB_PORT=3306

# Redis (Railway Redis)
REDIS_URL=redis://seu-redis-url.railway.app:6379

# Segurança
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
ENCRYPTION_KEY=sua_chave_de_criptografia_aqui

# CORS (domínios do Vercel)
CORS_ORIGIN=https://flig-mvp.vercel.app,https://flig-frontend.vercel.app

# APIs Externas
CNPJA_TOKEN=seu_token_cnpja_aqui
```

### **Passo 3: Deploy no Railway**
1. Conecte o repositório GitHub ao Railway
2. Selecione a pasta `flig-mvp/backend`
3. Railway vai detectar automaticamente o `package.json`
4. Deploy automático!

---

## 🎨 **2. DEPLOY FRONTEND NO VERCEL**

### **Passo 1: Preparar o Frontend**
```bash
cd flig-mvp/frontend
npm install
npm run build
```

### **Passo 2: Configurar Variáveis de Ambiente no Vercel**
No painel do Vercel, adicione estas variáveis:

```env
VITE_API_URL=https://seu-backend.railway.app/api
```

### **Passo 3: Deploy no Vercel**
1. Conecte o repositório GitHub ao Vercel
2. Selecione a pasta `flig-mvp/frontend`
3. Vercel vai detectar automaticamente o `vercel.json`
4. Deploy automático!

---

## 🔧 **3. CONFIGURAÇÕES FINAIS**

### **Backend (Railway)**
- ✅ Health check: `/api/health`
- ✅ CORS configurado para domínios do Vercel
- ✅ Rate limiting ativo
- ✅ JWT authentication

### **Frontend (Vercel)**
- ✅ Build automático com Vite
- ✅ SPA routing configurado
- ✅ Variáveis de ambiente para API

---

## 🌐 **4. URLs FINAIS**

- **Backend**: `https://seu-backend.railway.app`
- **Frontend**: `https://flig-mvp.vercel.app`
- **API Health**: `https://seu-backend.railway.app/api/health`

---

## 🚨 **5. TROUBLESHOOTING**

### **Problema: CORS Error**
- Verifique se o domínio do Vercel está no `CORS_ORIGIN` do Railway

### **Problema: API não conecta**
- Verifique se `VITE_API_URL` está correto no Vercel
- Teste a API diretamente: `https://seu-backend.railway.app/api/health`

### **Problema: Banco de dados**
- Verifique as variáveis de ambiente do MySQL no Railway
- Execute o schema: `mysql -u root -p < database/schema_corrigido.sql`

---

## 🎉 **DEPLOY COMPLETO!**

Agora você tem:
- ✅ Backend rodando no Railway
- ✅ Frontend rodando no Vercel
- ✅ Banco de dados MySQL no Railway
- ✅ Redis no Railway
- ✅ CORS configurado
- ✅ Variáveis de ambiente seguras
