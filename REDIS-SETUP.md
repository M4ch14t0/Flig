# 🔴 Configuração do Redis - Railway

## Por que o Redis é importante?

O Redis é usado no Flig para:
- ✅ **Gerenciar filas** de clientes
- ✅ **Cache de sessões** de usuários
- ✅ **Controle de chamadas** automáticas
- ✅ **Tempo de espera** em tempo real
- ✅ **Notificações** push

## 🚂 Configuração no Railway

### 1. Criar Redis
1. No Railway → **New** → **Database** → **Redis**
2. **Aguarde** a criação (1-2 minutos)
3. **Copie** a `REDIS_URL` gerada

### 2. Configurar Variáveis
No Railway → **Variables** → Adicione:
```bash
REDIS_URL=redis://default:password@host:port
```

### 3. Verificar Conexão
No backend, o Redis deve conectar automaticamente usando a `REDIS_URL`.

## 🔧 Configuração no Código

### Backend (services/redis.js)
```javascript
const redis = require('redis');

// Conecta usando a URL do Railway
const client = redis.createClient({
  url: process.env.REDIS_URL
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

### 1. Verificar Logs
No Railway → **Deployments** → **Logs**:
```
✅ Redis conectado!
✅ Servidor rodando na porta 3000
```

### 2. Testar Funcionalidades
- ✅ Login de usuários (sessões)
- ✅ Entrar em fila (Redis queue)
- ✅ Chamar próximo cliente
- ✅ Tempo de espera

## 🚨 Problemas Comuns

### Redis não conecta
```bash
# Verificar se REDIS_URL está configurada
# Verificar se Redis está ativo no Railway
# Verificar logs do backend
```

### Erro de permissão
```bash
# Verificar se a URL está correta
# Verificar se o Redis está público
```

### Timeout de conexão
```bash
# Verificar se o Redis está ativo
# Verificar firewall/portas
```

## 📊 Monitoramento

### Railway Dashboard
- **Status**: Verde = Funcionando
- **Conexões**: Número de clientes conectados
- **Memória**: Uso de RAM do Redis

### Logs do Backend
```bash
# Logs normais:
✅ Redis conectado!

# Logs de erro:
❌ Redis Client Error: Connection refused
```

## 🔄 Backup e Recuperação

### Backup Automático
O Railway faz backup automático do Redis.

### Recuperação
1. Railway → **Database** → **Redis**
2. **Settings** → **Backup**
3. **Restore** se necessário

## ✅ Checklist Redis

- [ ] Redis criado no Railway
- [ ] REDIS_URL configurada
- [ ] Backend conectando ao Redis
- [ ] Logs mostrando "Redis conectado!"
- [ ] Funcionalidades de fila funcionando
- [ ] Sessões de usuário funcionando

## 🎯 Resultado Final

Com o Redis configurado:
- ✅ **Filas funcionam** perfeitamente
- ✅ **Sessões são mantidas** entre recarregamentos
- ✅ **Chamadas automáticas** funcionam
- ✅ **Tempo de espera** é calculado em tempo real
- ✅ **Notificações** são enviadas

**🔴 Redis é essencial para o funcionamento do Flig!**
