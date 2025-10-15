# 🔧 Corrigir Problemas de Conexão - Railway

## 🚨 Problemas Identificados

### ❌ **MySQL Connection Error:**
```
❌ Erro ao conectar com MySQL: getaddrinfo ENOTFOUND mysql://root:ALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI@mysql.railway.internal:3306/railway
```

### ❌ **Redis Connection Error:**
```
❌ Erro no Redis: Error: connect ECONNREFUSED fd12:e38b:790e:0:a000:74:12a0:1ca2:56245
```

## ✅ Soluções

### 1. Corrigir Variáveis de Ambiente

#### **MySQL - Usar URLs Internas:**
```bash
# ❌ ERRADO (URLs externas)
DB_HOST=shinkansen.proxy.rlwy.net
DB_PORT=34823
DB_NAME=flig_db

# ✅ CORRETO (URLs internas)
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=ALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI
```

#### **Redis - Usar Variáveis do Railway:**
```bash
# ❌ ERRADO (URLs fixas)
REDIS_HOST=redis.railway.internal
REDIS_PORT=56245

# ✅ CORRETO (Variáveis do Railway)
REDIS_PASSWORD=EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq
REDIS_PUBLIC_URL=redis://default:${{REDIS_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}
REDIS_URL=redis://${{REDISUSER}}:${{REDIS_PASSWORD}}@${{REDISHOST}}:${{REDISPORT}}
REDISHOST=${{RAILWAY_PRIVATE_DOMAIN}}
REDISPASSWORD=${{REDIS_PASSWORD}}
REDISPORT=56245
REDISUSER=default
```

### 2. Variáveis Corretas para Railway

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
REDIS_PUBLIC_URL=redis://default:${{REDIS_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}
REDIS_URL=redis://${{REDISUSER}}:${{REDIS_PASSWORD}}@${{REDISHOST}}:${{REDISPORT}}
REDISHOST=${{RAILWAY_PRIVATE_DOMAIN}}
REDISPASSWORD=${{REDIS_PASSWORD}}
REDISPORT=56245
REDISUSER=default
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

## 🔧 Configuração no Código

### 1. Verificar config/db.js
```javascript
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
```

### 2. Verificar services/redis.js
```javascript
const redis = require('redis');

// Usar REDIS_URL que já contém todas as informações
const client = redis.createClient({
  url: process.env.REDIS_URL,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('✅ Redis conectado!');
});

module.exports = client;
```

## 🧪 Teste de Conexão

### 1. Testar MySQL
```bash
# No Railway, testar conexão interna
mysql -h mysql.railway.internal -P 3306 -u root -pALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI railway -e "SELECT 1;"
```

### 2. Testar Redis
```bash
# No Railway, testar conexão interna
redis-cli -h redis.railway.internal -p 56245 -a EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq ping
```

### 3. Testar Backend
```bash
# Health check
curl https://flig-backend-production.up.railway.app/api/health
```

## 📋 Checklist de Correção

### Backend (Railway)
- [ ] **DB_HOST**: mysql.railway.internal
- [ ] **DB_PORT**: 3306
- [ ] **DB_NAME**: railway
- [ ] **DB_USER**: root
- [ ] **DB_PASSWORD**: ALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI
- [ ] **REDIS_URL**: redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@redis.railway.internal:56245
- [ ] **REDIS_HOST**: redis.railway.internal
- [ ] **REDIS_PORT**: 56245
- [ ] **REDIS_PASSWORD**: EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq

### Testes
- [ ] **MySQL** conecta sem erros
- [ ] **Redis** conecta sem erros
- [ ] **Backend** inicia sem erros
- [ ] **Health check** funciona
- [ ] **API** responde corretamente

## 🚨 Problemas Comuns

### MySQL não conecta
```bash
# Verificar se as variáveis estão corretas
# Verificar se o banco está ativo
# Verificar se está usando URLs internas
```

### Redis não conecta
```bash
# Verificar se REDIS_URL está correto
# Verificar se está usando URLs internas
# Verificar se o Redis está ativo
```

### CORS Error
```bash
# Verificar se CORS_ORIGIN está configurado
# Verificar se a URL do frontend está correta
```

## ✅ Resultado Final

Após as correções:
- ✅ **MySQL** conecta usando URLs internas
- ✅ **Redis** conecta usando URLs internas
- ✅ **Backend** inicia sem erros
- ✅ **API** responde corretamente
- ✅ **CORS** configurado corretamente

## 🎯 Próximos Passos

1. ✅ **Corrigir** variáveis de ambiente
2. ✅ **Testar** conexões
3. ✅ **Verificar** logs do backend
4. ✅ **Fazer** deploy do frontend
5. ✅ **Testar** aplicação completa

**🎉 Problemas de conexão corrigidos!**
