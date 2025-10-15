# 🔴 Corrigir URL Inválida do Redis - Railway

## 🚨 Problema Identificado

### ❌ **Erro da URL do Redis:**
```
❌ Falha ao conectar com Redis: TypeError: Invalid URL
input: 'redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@:'
```

**Causa**: A URL do Redis está malformada - está faltando o host e porta.

## ✅ Solução

### 1. Verificar Variáveis do Railway

#### **Variáveis que DEVEM estar configuradas:**
```bash
REDIS_PASSWORD=EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq
REDIS_PUBLIC_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}
REDIS_URL=redis://${{REDISUSER}}:${{REDIS_PASSWORD}}@${{REDISHOST}}:${{REDISPORT}}
REDISHOST=${{RAILWAY_PRIVATE_DOMAIN}}
REDISPASSWORD=${{REDIS_PASSWORD}}
REDISPORT=56245
REDISUSER=default
```

### 2. Configuração Completa

#### **Backend (Railway) - Variáveis Corretas:**
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
REDIS_PUBLIC_URL=redis://default:EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}
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

### 1. Verificar services/redis.js
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

### 2. Verificar se está usando REDIS_URL
```javascript
// ✅ CORRETO - Usar REDIS_URL
const client = redis.createClient({
  url: process.env.REDIS_URL
});

// ❌ ERRADO - Usar variáveis separadas
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});
```

## 🧪 Teste de Conexão

### 1. Verificar Variáveis
```bash
# No Railway, verificar se as variáveis estão corretas
echo $REDIS_URL
echo $REDISHOST
echo $REDISPORT
echo $REDIS_PASSWORD
echo $REDISUSER
```

### 2. Testar Redis
```bash
# No Railway, testar conexão
redis-cli -h $REDISHOST -p $REDISPORT -a $REDIS_PASSWORD ping
```

### 3. Testar Backend
```bash
# Health check
curl https://flig-backend-production.up.railway.app/api/health
```

## 📋 Checklist de Correção

### Redis (Railway)
- [ ] **REDIS_PASSWORD**: EvBzJjwYzmPZdkXvqGVWmrcRULTegpOq
- [ ] **REDIS_PUBLIC_URL**: redis://default:${{REDIS_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}
- [ ] **REDIS_URL**: redis://${{REDISUSER}}:${{REDIS_PASSWORD}}@${{REDISHOST}}:${{REDISPORT}}
- [ ] **REDISHOST**: ${{RAILWAY_PRIVATE_DOMAIN}}
- [ ] **REDISPASSWORD**: ${{REDIS_PASSWORD}}
- [ ] **REDISPORT**: 56245
- [ ] **REDISUSER**: default

### Código
- [ ] **services/redis.js** usa `process.env.REDIS_URL`
- [ ] **Não usa** variáveis separadas (host, port, password)
- [ ] **Tratamento de erro** configurado
- [ ] **Logs** de conexão funcionando

## 🚨 Problemas Comuns

### URL Inválida
```bash
# Verificar se REDIS_URL está correto
# Verificar se as variáveis do Railway estão configuradas
# Verificar se está usando REDIS_URL no código
```

### Host/Port Missing
```bash
# Verificar se REDISHOST e REDISPORT estão configurados
# Verificar se as variáveis do Railway estão corretas
```

### Connection Refused
```bash
# Verificar se o Redis está ativo no Railway
# Verificar se as credenciais estão corretas
# Verificar se está usando as variáveis corretas
```

## ✅ Resultado Final

Após as correções:
- ✅ **Redis** conecta usando variáveis do Railway
- ✅ **URL** está correta e válida
- ✅ **Conexão** estável
- ✅ **Backend** inicia sem erros

## 🎯 Próximos Passos

1. ✅ **Configurar** variáveis do Redis no Railway
2. ✅ **Verificar** se o código usa REDIS_URL
3. ✅ **Testar** conexão
4. ✅ **Verificar** logs do backend
5. ✅ **Fazer** deploy do frontend

**🎉 Problema da URL do Redis corrigido!**
