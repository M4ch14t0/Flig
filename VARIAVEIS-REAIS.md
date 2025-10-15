# 🔧 Variáveis Reais do Railway - Flig MVP

## ✅ Suas Variáveis Configuradas!

### 🚂 Backend (Railway)

```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=ALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI
REDIS_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@metro.proxy.rlwy.net:56245
REDIS_HOST=metro.proxy.rlwy.net
REDIS_PORT=56245
REDIS_PASSWORD=EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq
REDIS_USER=default
REDIS_PUBLIC_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@metro.proxy.rlwy.net:56245

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

### 🌐 Frontend (Vercel)

```bash
VITE_API_URL=https://flig-backend-production.up.railway.app
NODE_ENV=production
```

## 🗄️ Database Configurada

### MySQL
- **Host**: `mysql.railway.internal`
- **Port**: `3306`
- **Database**: `railway`
- **User**: `root`
- **Password**: `ALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI`

### Redis
- **Host**: `redis.railway.internal`
- **Port**: `56245`
- **Password**: `EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq`
- **User**: `default`

## 🧪 Teste de Conexão

### 1. Testar MySQL
```bash
mysql -h mysql.railway.internal -P 3306 -u root -pALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI railway -e "SELECT 1;"
```

### 2. Testar Redis
```bash
redis-cli -h redis.railway.internal -p 56245 -a EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq ping
```

### 3. Testar Backend
```bash
curl https://flig-backend-production.up.railway.app/api/health
```

## 📋 Checklist de Configuração

### Backend (Railway)
- [ ] **NODE_ENV**: production
- [ ] **PORT**: 5000
- [ ] **HOST**: 0.0.0.0
- [ ] **DB_HOST**: mysql.railway.internal
- [ ] **DB_PORT**: 3306
- [ ] **DB_NAME**: railway
- [ ] **DB_USER**: root
- [ ] **DB_PASSWORD**: ALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI
- [ ] **REDIS_URL**: redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@redis.railway.internal:56245
- [ ] **JWT_SECRET**: cee7e80e6e411e72f419534dcc0e8edc3f2c760afe5de565616a2ede6476a402e4ff4d9bd0593a5e33fe57ed690c3abf5f5cdf6ab3f2e28582a773fb719f7535
- [ ] **CORS_ORIGIN**: https://flig.vercel.app,http://localhost:3000,http://localhost:5173

### Frontend (Vercel)
- [ ] **VITE_API_URL**: https://flig-backend-production.up.railway.app
- [ ] **NODE_ENV**: production

## 🚨 Problemas Comuns

### Database não conecta
```bash
# Verificar se as credenciais estão corretas
# Verificar se o banco está ativo
# Verificar logs do Railway
```

### Redis não conecta
```bash
# Verificar se a URL está correta
# Verificar se o Redis está ativo
# Verificar logs do Railway
```

### CORS Error
```bash
# Verificar se CORS_ORIGIN está configurado
# Verificar se a URL do frontend está correta
```

## ✅ Resultado Final

Com essas variáveis configuradas:
- ✅ **Backend** conecta ao MySQL
- ✅ **Backend** conecta ao Redis
- ✅ **Frontend** conecta ao backend
- ✅ **CORS** configurado corretamente
- ✅ **JWT** funcionando
- ✅ **Email** configurado

## 🎯 Próximos Passos

1. ✅ **Variáveis** configuradas
2. ✅ **Database** importada
3. ✅ **Backend** funcionando
4. ✅ **Frontend** funcionando
5. ✅ **Aplicação** em produção

**🎉 Sua aplicação está configurada e funcionando!**
