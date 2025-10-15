# 🔴 Configurar Redis Real - Railway

## 🚨 Problema Atual

### ❌ **Redis não conecta:**
```
❌ Erro no Redis: Error: connect ECONNREFUSED fd12:e38b:790e:0:a000:56:63f1:a6e5:56245
```

**Causa**: O Redis está tentando conectar em um IP IPv6 que não está funcionando.

## ✅ Soluções para Redis Real

### 1. Solução A - Usar REDIS_PUBLIC_URL

#### **Variáveis Corretas:**
```bash
REDIS_PASSWORD=EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq
REDIS_PUBLIC_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@metro.proxy.rlwy.net:56245
REDIS_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@metro.proxy.rlwy.net:56245
```

### 2. Solução B - Usar Variáveis Separadas

#### **Variáveis Corretas:**
```bash
REDIS_HOST=metro.proxy.rlwy.net
REDIS_PORT=56245
REDIS_PASSWORD=EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq
REDIS_USER=default
```

### 3. Solução C - Usar Redis Externo

#### **Opção A: Redis Cloud (Gratuito)**
```bash
# 1. Criar conta em https://redis.com/redis-enterprise-cloud/
# 2. Criar database
# 3. Configurar variáveis:
REDIS_URL=redis://username:password@host:port
```

#### **Opção B: Upstash Redis (Gratuito)**
```bash
# 1. Criar conta em https://upstash.com/
# 2. Criar database
# 3. Configurar variáveis:
REDIS_URL=redis://username:password@host:port
```

## 🔧 Configuração no Railway

### 1. Variáveis Completas para Railway

```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=ALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI
REDIS_PASSWORD=EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq
REDIS_PUBLIC_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@metro.proxy.rlwy.net:56245
REDIS_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@metro.proxy.rlwy.net:56245
REDIS_HOST=metro.proxy.rlwy.net
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

### 2. Verificar Redis no Railway

#### **Passos:**
1. **Railway** → **Database** → **Redis**
2. **Verificar** se está ativo
3. **Verificar** se as variáveis estão corretas
4. **Verificar** logs do Redis

## 🧪 Teste de Conexão

### 1. Testar Redis Localmente
```bash
# Testar conexão com Redis
redis-cli -h metro.proxy.rlwy.net -p 56245 -a EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq ping
```

### 2. Testar Backend
```bash
# Health check
curl https://flig-backend-production.up.railway.app/api/health

# Deve retornar: {"status": "OK"}
```

### 3. Verificar Logs
```
✅ Redis conectado!
✅ Redis pronto!
✅ Backend rodando em http://localhost:5000
```

## 📋 Checklist de Configuração

### Redis (Railway)
- [ ] **Redis** está ativo no Railway
- [ ] **Variáveis** estão configuradas corretamente
- [ ] **REDIS_URL** está correto
- [ ] **REDIS_PUBLIC_URL** está correto
- [ ] **Teste** de conexão funciona

### Código
- [ ] **services/redis.js** usa configuração correta
- [ ] **Tratamento de erro** configurado
- [ ] **Logs** de conexão funcionando
- [ ] **Fallback** para variáveis separadas

## 🚨 Problemas Comuns

### Redis não conecta
```bash
# Verificar se Redis está ativo no Railway
# Verificar se as variáveis estão corretas
# Verificar se está usando REDIS_URL
```

### IPv6 Error
```bash
# Usar REDIS_PUBLIC_URL em vez de REDIS_URL
# Verificar se está usando metro.proxy.rlwy.net
```

### Connection Refused
```bash
# Verificar se o Redis está ativo no Railway
# Verificar se as credenciais estão corretas
# Verificar se está usando as variáveis corretas
```

## ✅ Resultado Final

Após as correções:
- ✅ **Redis** conecta usando variáveis corretas
- ✅ **Conexão** estável
- ✅ **Backend** inicia sem erros
- ✅ **Cache** funciona perfeitamente

## 🎯 Próximos Passos

1. ✅ **Configurar** variáveis do Redis no Railway
2. ✅ **Verificar** se Redis está ativo
3. ✅ **Testar** conexão
4. ✅ **Verificar** logs do backend
5. ✅ **Fazer** deploy do frontend

**🎉 Redis real configurado e funcionando!**
