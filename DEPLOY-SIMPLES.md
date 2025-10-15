# 🚀 Deploy Simples - Flig MVP (Via Interface Web)

## 🚂 Backend no Railway (10 min)

### 1. Preparar o Backend
```bash
cd flig-mvp/backend
```

### 2. Criar railway.json (se não existir)
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
1. **Acesse**: [railway.app](https://railway.app)
2. **Login**: Use sua conta GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Selecione**: `flig-mvp/backend`
5. **Aguarde**: O Railway vai fazer o build automaticamente

### 4. Configurar Banco de Dados
1. No Railway → **New** → **Database** → **MySQL**
2. **Aguarde** a criação do banco
3. **Copie** a `DATABASE_URL` gerada

### 5. Configurar Redis
1. No Railway → **New** → **Database** → **Redis**
2. **Aguarde** a criação do Redis
3. **Copie** a `REDIS_URL` gerada

### 6. Configurar Variáveis de Ambiente
No Railway → **Variables** → Adicione:

```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=shinkansen.proxy.rlwy.net
DB_PORT=34823
DB_NAME=flig_db
DB_USER=root
DB_PASSWORD=XTtZbdYBcTsBNRqekJDbhdUBVSeFPFho
REDIS_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@metro.proxy.rlwy.net:56245
JWT_SECRET=cee7e80e6e411e72f419534dcc0e8edc3f2c760afe5de565616a2ede6476a402e4ff4d9bd0593a5e33fe57ed690c3abf5f5cdf6ab3f2e28582a773fb719f7535
CORS_ORIGIN=https://flig.vercel.app,http://localhost:3000,http://localhost:5173
```

### 7. Executar SQL do Banco
1. Railway → **Database** → **Connect**
2. Execute o arquivo `database/Flig2.sql` (sua database atual)
3. **Pronto!** Backend funcionando

---

## 🌐 Frontend no Vercel (5 min)

### 1. Preparar o Frontend
```bash
cd flig-mvp/frontend
```

### 2. Criar vercel.json (se não existir)
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
1. **Acesse**: [vercel.com](https://vercel.com)
2. **Login**: Use sua conta GitHub
3. **New Project** → **Import GitHub repo**
4. **Configure**:
   - **Root Directory**: `flig-mvp/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Deploy** → Aguarde o build

### 4. Configurar Variáveis de Ambiente
No Vercel → **Settings** → **Environment Variables**:

```bash
VITE_API_URL=https://seu-backend.railway.app
NODE_ENV=production
```

### 5. Atualizar API no Frontend
No arquivo `src/services/api.js`, certifique-se que está assim:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://seu-backend.railway.app';
```

---

## ✅ Teste Final

### 1. Testar Backend
```bash
# Cole no navegador:
https://seu-backend.railway.app/api/health

# Deve retornar: {"status": "OK"}
```

### 2. Testar Frontend
1. Acesse a URL do Vercel
2. Teste login/logout
3. Verifique se carrega dados da API

### 3. Conectar Frontend → Backend
1. No Vercel → **Settings** → **Environment Variables**
2. Adicione: `VITE_API_URL=https://seu-backend.railway.app`
3. **Redeploy** o frontend

---

## 🔧 Variáveis Essenciais

### Backend (Railway)
```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=shinkansen.proxy.rlwy.net
DB_PORT=34823
DB_NAME=flig_db
DB_USER=root
DB_PASSWORD=XTtZbdYBcTsBNRqekJDbhdUBVSeFPFho
REDIS_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@metro.proxy.rlwy.net:56245
JWT_SECRET=cee7e80e6e411e72f419534dcc0e8edc3f2c760afe5de565616a2ede6476a402e4ff4d9bd0593a5e33fe57ed690c3abf5f5cdf6ab3f2e28582a773fb719f7535
CORS_ORIGIN=https://flig.vercel.app,http://localhost:3000,http://localhost:5173
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://flig-backend-production.up.railway.app
NODE_ENV=production
```

---

## 🚨 Problemas Comuns

### Backend não inicia
- ✅ Verificar se `server.js` existe
- ✅ Verificar variáveis de ambiente
- ✅ Verificar logs no Railway

### Frontend não carrega
- ✅ Verificar se build passou
- ✅ Verificar variáveis de ambiente
- ✅ Verificar se API está acessível

### CORS Error
- ✅ Verificar `CORS_ORIGIN` no backend
- ✅ Verificar se URL do frontend está correta

---

## 📱 URLs Finais

Após o deploy:
- **Frontend**: `https://flig-frontend.vercel.app`
- **Backend**: `https://flig-backend-production.up.railway.app`

---

## 🎯 Checklist

### Backend (Railway)
- [ ] Projeto conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Banco MySQL criado
- [ ] Redis criado
- [ ] SQL executado
- [ ] Health check funcionando

### Frontend (Vercel)
- [ ] Projeto conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando
- [ ] API conectada

**🎉 Deploy Concluído!**

**Tempo total**: ~15 minutos
**Sem instalação de CLIs**: ✅
**Tudo via interface web**: ✅
