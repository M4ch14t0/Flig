# 🚀 **GUIA COMPLETO DE DEPLOY - SISTEMA FLIG**

## 📋 **PRÉ-REQUISITOS**

### **1. Contas Necessárias**
- ✅ **Railway** (Backend + Database + Redis)
- ✅ **Vercel** (Frontend)
- ✅ **GitHub** (Repositório)

### **2. Ferramentas Locais**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Instalar Vercel CLI
npm install -g vercel

# Verificar se está logado
railway login
vercel login
```

---

## 🗄️ **PASSO 1: CONFIGURAR BANCO DE DADOS NO RAILWAY**

### **1.1 Conectar ao MySQL do Railway**
```bash
# Usar a conexão pública fornecida
mysql://root:XTtZbdYBcTsBNRqekJDbhdUBVSeFPFho@shinkansen.proxy.rlwy.net:34823/flig_db
```

### **1.2 Executar Scripts SQL**
```sql
-- 1. Adicionar campos de tempo de espera
ALTER TABLE filas ADD COLUMN tempo_medio_espera DECIMAL(8,2) DEFAULT 0.00,
ADD COLUMN total_atendidos_tempo INT DEFAULT 0,
ADD COLUMN ultima_atualizacao_tempo TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Adicionar campos de chamada automática
ALTER TABLE filas ADD COLUMN chamada_automatica BOOLEAN DEFAULT FALSE,
ADD COLUMN intervalo_chamada INT DEFAULT 5,
ADD COLUMN ultima_chamada TIMESTAMP NULL,
ADD COLUMN modo_chamada ENUM('manual', 'automatico') DEFAULT 'manual',
ADD COLUMN tempo_medio_atendimento DECIMAL(8,2) DEFAULT 0.00,
ADD COLUMN total_atendimentos_calculados INT DEFAULT 0;

-- 3. Criar tabela de histórico
CREATE TABLE IF NOT EXISTS historico_clientes_filas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  queue_id VARCHAR(36) NOT NULL,
  nome_cliente VARCHAR(255) NOT NULL,
  telefone_cliente VARCHAR(20),
  email_cliente VARCHAR(255),
  posicao_inicial INT NOT NULL,
  posicao_final INT,
  tempo_espera INT,
  valor_pago DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('aguardando', 'chamado', 'atendido', 'cancelado', 'abandonou') DEFAULT 'aguardando',
  data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_saida TIMESTAMP NULL,
  tempo_entrada TIMESTAMP NULL,
  tempo_atendimento TIMESTAMP NULL,
  tempo_espera_minutos DECIMAL(8,2),
  tempo_atendimento_minutos DECIMAL(10,2),
  INDEX idx_queue_client (queue_id, client_id),
  INDEX idx_status (status),
  INDEX idx_data_entrada (data_entrada)
);

-- 4. Criar tabelas de planos
CREATE TABLE IF NOT EXISTS planos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  duracao_meses INT NOT NULL,
  recursos TEXT,
  max_filas INT DEFAULT 1,
  max_clientes_por_fila INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assinaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estabelecimento_id INT NOT NULL,
  plano_id INT NOT NULL,
  status ENUM('ativa', 'cancelada', 'expirada', 'pendente') DEFAULT 'pendente',
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_fim TIMESTAMP NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE,
  FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE CASCADE,
  INDEX idx_estabelecimento (estabelecimento_id),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assinatura_id INT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status ENUM('pendente', 'aprovado', 'rejeitado', 'cancelado') DEFAULT 'pendente',
  metodo_pagamento VARCHAR(50),
  transaction_id VARCHAR(255),
  data_pagamento TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE CASCADE,
  INDEX idx_assinatura (assinatura_id),
  INDEX idx_status (status)
);

-- 5. Adicionar campos de plano aos estabelecimentos
ALTER TABLE estabelecimentos ADD COLUMN plano_ativo_id INT DEFAULT NULL,
ADD COLUMN plano_vencimento TIMESTAMP NULL,
ADD FOREIGN KEY (plano_ativo_id) REFERENCES assinaturas(id) ON DELETE SET NULL;

-- 6. Inserir planos padrão
INSERT INTO planos (nome, descricao, preco, duracao_meses, recursos, max_filas, max_clientes_por_fila) VALUES 
('Gratuito', 'Plano básico para testes', 0.00, 1, '1 fila, até 10 clientes', 1, 10),
('Essencial', 'Plano para pequenos negócios', 29.90, 1, '3 filas, até 50 clientes por fila, relatórios básicos', 3, 50),
('Profissional', 'Plano completo para empresas', 59.90, 1, 'Filas ilimitadas, clientes ilimitados, relatórios avançados, API', 999, 999);
```

---

## 🔧 **PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE NO RAILWAY**

### **2.1 Acessar Railway Dashboard**
1. Vá para: https://railway.app/dashboard
2. Selecione seu projeto Flig
3. Vá em "Variables"

### **2.2 Adicionar/Atualizar Variáveis**
```env
# Variáveis existentes (manter)
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
CORS_ORIGIN=https://flig.vercel.app,http://localhost:3000,http://localhost:5173,https://flig-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=100

# NOVAS VARIÁVEIS PARA ADICIONAR
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gmail
EMAIL_FROM=noreply@flig.com.br
EMAIL_SECURE=false

# Mercado Pago (para testes)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-7477222719242827-100907-b5c7d9ea85eefbe4ef46c5f983df8d3b-2915256254
MERCADO_PAGO_PUBLIC_KEY=APP_USR-7616128e-d521-46ba-8c57-d263053ca18d

# SMTP (alternativo)
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

---

## 🚀 **PASSO 3: DEPLOY DO BACKEND NO RAILWAY**

### **3.1 Preparar Código**
```bash
# No diretório do projeto
cd /home/matoso/Documents/Flig

# Verificar se tudo está commitado
git status
git add .
git commit -m "feat: preparar para deploy em produção"
git push origin main
```

### **3.2 Deploy Automático**
O Railway fará deploy automático quando detectar mudanças no repositório.

### **3.3 Verificar Deploy**
```bash
# Verificar logs
railway logs --follow

# Testar health check
curl https://flig-production.up.railway.app/health

# Testar endpoint de login
curl -X POST https://flig-production.up.railway.app/api/auth/login/user \
  -H "Content-Type: application/json" \
  -d '{"email_usuario":"rafaelmo10@outlook.com.br","senha_usuario":"@Azpx3050"}'
```

---

## 🌐 **PASSO 4: DEPLOY DO FRONTEND NO VERCEL**

### **4.1 Configurar Variáveis do Frontend**
```bash
# No diretório do frontend
cd /home/matoso/Documents/Flig/flig-mvp/frontend

# Criar arquivo de produção
echo "VITE_API_URL=https://flig-production.up.railway.app" > .env.production
```

### **4.2 Build e Deploy**
```bash
# Build para produção
npm run build

# Deploy no Vercel
npx vercel --prod

# Ou se já configurado
vercel --prod
```

### **4.3 Configurar Variáveis no Vercel**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto Flig
3. Vá em "Settings" → "Environment Variables"
4. Adicione:
```env
VITE_API_URL=https://flig-production.up.railway.app
```

---

## ✅ **PASSO 5: TESTES PÓS-DEPLOY**

### **5.1 Testes Básicos**
```bash
# 1. Testar backend
curl https://flig-production.up.railway.app/health

# 2. Testar frontend
# Acesse: https://seu-dominio.vercel.app

# 3. Testar login
curl -X POST https://flig-production.up.railway.app/api/auth/login/user \
  -H "Content-Type: application/json" \
  -d '{"email_usuario":"rafaelmo10@outlook.com.br","senha_usuario":"@Azpx3050"}'
```

### **5.2 Testes Funcionais**
1. **Login como Cliente**: `rafaelmo10@outlook.com.br` / `@Azpx3050`
2. **Login como Estabelecimento**: `rafaelmatosoliveira7@gmail.com` / `@Azpx3050`
3. **Criar Fila** (como estabelecimento)
4. **Entrar na Fila** (como cliente)
5. **Avançar Posições** (sistema de pagamento)

---

## 🔍 **PASSO 6: MONITORAMENTO E DEBUG**

### **6.1 Logs do Railway**
```bash
# Ver logs em tempo real
railway logs --follow

# Ver logs específicos
railway logs --service backend
```

### **6.2 Logs do Vercel**
```bash
# Ver logs do frontend
vercel logs --follow
```

### **6.3 Verificar Banco de Dados**
```bash
# Conectar ao MySQL do Railway
railway connect mysql

# Verificar tabelas criadas
SHOW TABLES;
DESCRIBE filas;
DESCRIBE historico_clientes_filas;
DESCRIBE planos;
```

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Erro 500 no Backend**
```bash
# Verificar logs
railway logs --follow

# Verificar variáveis de ambiente
railway variables

# Verificar se banco está conectado
railway connect mysql
```

#### **2. CORS Error no Frontend**
- Verificar `CORS_ORIGIN` no Railway
- Adicionar domínio do Vercel na lista

#### **3. Database Connection Error**
- Verificar credenciais do banco
- Verificar se tabelas foram criadas
- Executar scripts SQL novamente

#### **4. Email não funciona**
- Verificar credenciais do Gmail
- Usar senha de app (não senha normal)
- Verificar configurações SMTP

### **Comandos de Debug**
```bash
# Status do Railway
railway status

# Variáveis de ambiente
railway variables

# Conectar ao banco
railway connect mysql

# Conectar ao Redis
railway connect redis
```

---

## 📊 **CHECKLIST FINAL**

### **Backend (Railway)**
- [ ] Banco de dados configurado
- [ ] Tabelas criadas
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Health check funcionando
- [ ] Logs sem erros

### **Frontend (Vercel)**
- [ ] Build realizado
- [ ] Deploy realizado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado
- [ ] Aplicação carregando

### **Funcionalidades**
- [ ] Login funcionando
- [ ] Criação de filas funcionando
- [ ] Sistema de pagamentos funcionando
- [ ] Avanço de posições funcionando
- [ ] Emails funcionando (se configurado)

---

## 🎉 **DEPLOY CONCLUÍDO!**

Após seguir todos os passos, seu sistema Flig estará rodando em produção com:

- **Backend**: https://flig-production.up.railway.app
- **Frontend**: https://seu-dominio.vercel.app
- **Database**: MySQL no Railway
- **Cache**: Redis no Railway

**Status**: ✅ **SISTEMA EM PRODUÇÃO E FUNCIONAL**
