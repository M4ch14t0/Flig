# 🚀 Configuração de Produção - Sistema Flig

Este guia explica como configurar o Sistema Flig para produção com segurança e boas práticas.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- MySQL 8.0+ instalado e configurado
- Redis 6.0+ instalado e configurado
- Servidor Linux (Ubuntu/CentOS recomendado)
- Domínio configurado (opcional)

## 🔧 Configuração Automática

### 1. Execute o script de configuração:

```bash
npm run setup:production
```

Este script irá:
- ✅ Verificar dependências
- ✅ Criar diretórios necessários
- ✅ Gerar arquivo `.env.production` com valores seguros
- ✅ Verificar configurações de segurança

### 2. Configure as variáveis de ambiente:

Edite o arquivo `.env.production` com suas configurações reais:

```bash
nano .env.production
```

## 🔐 Configurações de Segurança

### JWT Secret
```env
JWT_SECRET=seu-jwt-secret-super-seguro-com-256-bits
```

### Chave de Criptografia
```env
ENCRYPTION_KEY=sua-chave-de-32-caracteres
```

### Senhas do Banco
```env
DB_PASSWORD=sua-senha-segura-do-mysql
REDIS_PASSWORD=sua-senha-segura-do-redis
```

## 🗄️ Configuração do Banco de Dados

### 1. Crie o banco de dados:

```sql
CREATE DATABASE flig_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Crie um usuário específico:

```sql
CREATE USER 'flig_user'@'localhost' IDENTIFIED BY 'sua-senha-segura';
GRANT ALL PRIVILEGES ON flig_db.* TO 'flig_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Execute o schema:

```bash
mysql -u flig_user -p flig_db < database/schema_corrigido.sql
```

## 🔴 Configuração do Redis

### 1. Configure senha no Redis:

```bash
# Edite o arquivo de configuração
sudo nano /etc/redis/redis.conf

# Adicione a linha:
requirepass sua-senha-segura-do-redis

# Reinicie o Redis
sudo systemctl restart redis
```

## 🌐 Configuração de APIs Externas

### CNPJá API
1. Acesse: https://www.cnpja.com/
2. Crie uma conta
3. Obtenha seu token
4. Configure no `.env.production`:
```env
CNPJA_TOKEN=seu-token-da-cnpja
```

### PagSeguro (Opcional)
1. Acesse: https://pagseguro.uol.com.br/
2. Crie uma conta de vendedor
3. Configure no `.env.production`:
```env
PAGSEGURO_EMAIL=seu-email@pagseguro.com
PAGSEGURO_TOKEN=seu-token-do-pagseguro
```

### Mercado Pago (Opcional)
1. Acesse: https://www.mercadopago.com.br/
2. Crie uma conta de desenvolvedor
3. Configure no `.env.production`:
```env
MERCADOPAGO_ACCESS_TOKEN=seu-access-token
MERCADOPAGO_PUBLIC_KEY=sua-public-key
```

## 📧 Configuração de Email (Opcional)

### Gmail SMTP
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
EMAIL_FROM=noreply@seu-dominio.com
```

## 🔔 Configuração de Notificações (Opcional)

### Firebase
1. Acesse: https://console.firebase.google.com/
2. Crie um projeto
3. Configure no `.env.production`:
```env
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY=sua-private-key
FIREBASE_CLIENT_EMAIL=seu-client-email
```

### SendGrid
1. Acesse: https://sendgrid.com/
2. Crie uma conta
3. Configure no `.env.production`:
```env
SENDGRID_API_KEY=sua-api-key
```

## 🚀 Deploy

### 1. Instale dependências:

```bash
npm install --production
```

### 2. Execute em produção:

```bash
npm run start:production
```

### 3. Configure PM2 (Recomendado):

```bash
# Instale PM2 globalmente
npm install -g pm2

# Inicie a aplicação
pm2 start server.js --name "flig-backend"

# Configure para iniciar automaticamente
pm2 startup
pm2 save
```

## 🔒 Configurações de Segurança Adicionais

### 1. Configure Firewall:

```bash
# Ubuntu/Debian
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5000  # API (se necessário)
sudo ufw enable
```

### 2. Configure SSL/TLS:

```bash
# Instale Certbot
sudo apt install certbot

# Obtenha certificado SSL
sudo certbot certonly --standalone -d seu-dominio.com
```

### 3. Configure Nginx (Recomendado):

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoramento

### 1. Configure Logs:

```bash
# Crie diretório de logs
sudo mkdir -p /var/log/flig
sudo chown $USER:$USER /var/log/flig
```

### 2. Configure Backup:

```bash
# Crie script de backup
sudo nano /usr/local/bin/flig-backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u flig_user -p flig_db > /var/backups/flig/backup_$DATE.sql
find /var/backups/flig -name "backup_*.sql" -mtime +30 -delete

# Configure cron
sudo crontab -e
# Adicione: 0 2 * * * /usr/local/bin/flig-backup.sh
```

## ✅ Checklist de Produção

- [ ] ✅ Dependências instaladas
- [ ] ✅ Banco de dados configurado
- [ ] ✅ Redis configurado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ APIs externas configuradas
- [ ] ✅ SSL/TLS configurado
- [ ] ✅ Firewall configurado
- [ ] ✅ Backup configurado
- [ ] ✅ Monitoramento configurado
- [ ] ✅ Logs configurados
- [ ] ✅ PM2 configurado
- [ ] ✅ Nginx configurado (opcional)

## 🆘 Troubleshooting

### Problemas Comuns:

1. **Erro de conexão com MySQL:**
   - Verifique se o MySQL está rodando
   - Verifique usuário e senha
   - Verifique se o banco existe

2. **Erro de conexão com Redis:**
   - Verifique se o Redis está rodando
   - Verifique senha do Redis
   - Verifique porta do Redis

3. **Erro de JWT:**
   - Verifique se JWT_SECRET está configurado
   - Verifique se o token não expirou

4. **Erro de CORS:**
   - Verifique CORS_ORIGIN no .env
   - Verifique se o frontend está na lista permitida

## 📞 Suporte

Para suporte técnico, entre em contato:
- Email: suporte@flig.com.br
- GitHub: https://github.com/seu-usuario/flig/issues

---

**⚠️ IMPORTANTE: Nunca commite arquivos .env com valores reais!**
