# 🚀 Deploy Final - Flig MVP (Database Corrigida)

## ✅ Database Pronta!

O arquivo `Flig2.sql` agora está correto com:
- ✅ **Estrutura completa** das tabelas
- ✅ **Dados reais** de usuários e estabelecimentos
- ✅ **Configurações** do sistema
- ✅ **Histórico** de clientes e transações

## 🚂 Backend no Railway (15 min)

### 1. Preparar Backend
```bash
cd flig-mvp/backend
```

### 2. Deploy no Railway
1. **Acesse**: [railway.app](https://railway.app)
2. **Login**: Use sua conta GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Selecione**: `flig-mvp/backend`
5. **Aguarde**: O Railway vai fazer o build automaticamente

### 3. Configurar Banco de Dados
1. **MySQL**: Railway → **New** → **Database** → **MySQL**
2. **Redis**: Railway → **New** → **Database** → **Redis**
3. **Aguarde** a criação dos bancos
4. **Copie** as URLs geradas

### 4. Importar Database
1. Railway → **Database** → **Connect**
2. **Execute**:
   ```sql
   CREATE DATABASE flig_production;
   USE flig_production;
   ```
3. **Cole** todo o conteúdo do arquivo `database/Flig2.sql`
4. **Execute** o script completo

### 5. Configurar Variáveis
No Railway → **Variables**:
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
REDIS_HOST=metro.proxy.rlwy.net:56245
REDIS_PORT=56245
REDIS_PASSWORD=EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq
REDIS_USER=default
JWT_SECRET=cee7e80e6e411e72f419534dcc0e8edc3f2c760afe5de565616a2ede6476a402e4ff4d9bd0593a5e33fe57ed690c3abf5f5cdf6ab3f2e28582a773fb719f7535
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=6619031e69a01ae8ebde3209c652d2605cbd8c42697c0932b15eac71db556aad
CNPJA_TOKEN=your-cnpja-api-token-here
VIACEP_API_URL=https://viacep.com.br/ws
CORS_ORIGIN=https://flig.vercel.app,http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=100
MAIL_USER=FligPTI@gmail.com
MAIL_PASS=pywg uidk gads eqso
```

---

## 🌐 Frontend no Vercel (5 min)

### 1. Preparar Frontend
```bash
cd flig-mvp/frontend
```

### 2. Deploy no Vercel
1. **Acesse**: [vercel.com](https://vercel.com)
2. **Login**: Use sua conta GitHub
3. **New Project** → **Import GitHub repo**
4. **Configure**:
   - **Root Directory**: `flig-mvp/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Configurar Variáveis
No Vercel → **Settings** → **Environment Variables**:
```bash
VITE_API_URL=https://seu-backend.railway.app
NODE_ENV=production
```

---

## 🧪 Teste Final

### 1. Testar Backend
```bash
# Health check
curl https://seu-backend.railway.app/api/health

# Deve retornar: {"status": "OK"}
```

### 2. Testar Frontend
1. Acesse a URL do Vercel
2. Teste login com usuários existentes:
   - **Email**: `rafaelmo10@outlook.com.br`
   - **Email**: `cepteste@teste.com`
3. Verifique se carrega dados das filas

### 3. Verificar Dados
- ✅ **3 estabelecimentos** carregando
- ✅ **16 usuários** podem fazer login
- ✅ **6 filas** funcionando
- ✅ **153 clientes** no histórico
- ✅ **32 transações** de pagamento

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

## 📋 Checklist Final

### Backend (Railway)
- [ ] Projeto conectado ao GitHub
- [ ] MySQL criado e configurado
- [ ] Redis criado e configurado
- [ ] Database `Flig2.sql` importada
- [ ] Variáveis de ambiente configuradas
- [ ] Health check funcionando

### Frontend (Vercel)
- [ ] Projeto conectado ao GitHub
- [ ] Build funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] API conectada ao backend

### Testes
- [ ] Login com usuários existentes
- [ ] Filas carregando corretamente
- [ ] Histórico de clientes funcionando
- [ ] Transações de pagamento visíveis

---

## 🎯 Resultado Final

Após o deploy, você terá:
- ✅ **Backend** rodando no Railway
- ✅ **Frontend** rodando no Vercel
- ✅ **Database** com dados reais
- ✅ **Redis** para filas e cache
- ✅ **Aplicação** 100% funcional

**URLs de Produção:**
- **Frontend**: `https://flig-frontend.vercel.app`
- **Backend**: `https://flig-backend-production.up.railway.app`

---

## 🚨 Troubleshooting

### Database não importa
```sql
-- Verificar se o banco existe
SHOW DATABASES;

-- Verificar tabelas
SHOW TABLES;
```

### Backend não conecta
```bash
# Verificar logs no Railway
# Verificar variáveis de ambiente
# Verificar se MySQL está ativo
```

### Frontend não carrega
```bash
# Verificar build no Vercel
# Verificar variáveis de ambiente
# Verificar se API está acessível
```

---

## 🎉 Deploy Concluído!

**Tempo total**: ~20 minutos
**Database**: ✅ Corrigida e pronta
**Deploy**: ✅ 100% via interface web
**Dados**: ✅ Reais e funcionais

**🚀 Sua aplicação está no ar!**
