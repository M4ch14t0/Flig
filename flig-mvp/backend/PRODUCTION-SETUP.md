# Configuração de Produção - Flig

## Variáveis de Ambiente

### Backend (.env)
```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=@Azpx3050
DB_NAME=flig_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=flig123

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_FROM=noreply@flig.com.br

# CORS
CORS_ORIGINS=http://localhost:3000,https://seu-dominio.com
```

### Frontend (.env.production)
```env
VITE_API_URL=https://api.flig.com.br
```

## Deploy no Railway

### 1. Configurar Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### 2. Variáveis no Railway
- `NODE_ENV=production`
- `DB_HOST=mysql.railway.internal`
- `REDIS_URL=redis://redis.railway.internal:6379`
- `JWT_SECRET=seu-secret`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_USER=seu-email@gmail.com`
- `EMAIL_PASS=sua-senha-de-app`

## Deploy no Vercel (Frontend)

### 1. Configurar Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 2. Variáveis no Vercel
- `VITE_API_URL=https://flig-production.up.railway.app`

## Monitoramento

### Logs
```bash
# Railway
railway logs

# Vercel
vercel logs
```

### Health Check
```bash
curl https://api.flig.com.br/health
```

## Backup

### Database
```bash
mysqldump -u admin -p flig_db > backup.sql
```

### Redis
```bash
redis-cli --rdb backup.rdb
```

## SSL/HTTPS

### Certificado SSL
- Railway: Automático
- Vercel: Automático
- Domínio próprio: Let's Encrypt

## Performance

### Otimizações
- Redis para cache
- Connection pooling MySQL
- Rate limiting
- CORS configurado

### Monitoramento
- Uptime: Railway dashboard
- Performance: Vercel analytics
- Errors: Railway logs
