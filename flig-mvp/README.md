# 🚀 Sistema Flig - Filas Virtuais Inteligentes

## 📋 Visão Geral

O **Flig** é um sistema completo de filas virtuais que permite estabelecimentos gerenciarem filas de forma eficiente e clientes aguardarem atendimento de forma confortável, com a possibilidade de avançar posições através de pagamentos.

## ✨ Funcionalidades Principais

### 👥 Para Clientes
- **Registro e Login** seguro com JWT
- **Busca de Estabelecimentos** por categoria e localização
- **Entrada em Filas** com dados pessoais
- **Avanço de Posições** através de pagamentos
- **Notificações em Tempo Real** sobre posição na fila
- **Histórico de Filas** e estatísticas pessoais
- **Interface Responsiva** para mobile e desktop

### 🏢 Para Estabelecimentos
- **Registro e Login** com validação de CNPJ
- **Criação e Gerenciamento de Filas** com configurações personalizadas
- **Dashboard Completo** com métricas e estatísticas
- **Relatórios Financeiros** e de atendimento
- **Controle de Posições** e tempo de espera
- **Sistema de Pagamentos** integrado
- **Notificações** sobre status das filas

### 🔧 Funcionalidades Técnicas
- **API RESTful** completa e documentada
- **Autenticação JWT** com middleware de segurança
- **Validação de Dados** em todas as entradas
- **Sistema de Pagamentos** simulado (pronto para integração real)
- **Notificações Push/Email/SMS** (estrutura implementada)
- **Testes Automatizados** para todas as funcionalidades
- **Rate Limiting** para proteção contra abuso
- **Logs Detalhados** para monitoramento

## 🏗️ Arquitetura

### Backend (Node.js + Express)
```
backend/
├── config/          # Configurações de banco e Redis
├── controllers/     # Lógica de negócio
├── middleware/      # Autenticação, validação, rate limiting
├── models/          # Modelos de dados
├── routes/          # Definição de rotas
├── services/        # Serviços externos (pagamento, notificação)
├── utils/           # Utilitários (criptografia, UUID)
├── tests/           # Testes automatizados
└── database/        # Schema e seeds do banco
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/  # Componentes reutilizáveis
│   ├── contexts/    # Contextos React (Auth)
│   ├── hooks/       # Hooks customizados
│   ├── pages/       # Páginas da aplicação
│   ├── routes/      # Configuração de rotas
│   ├── services/    # Integração com API
│   ├── styles/      # Estilos globais
│   └── utils/       # Utilitários frontend
├── public/          # Assets estáticos
└── assets/          # Imagens e ícones
```

### Banco de Dados (MySQL)
- **8 tabelas principais** com relacionamentos otimizados
- **Triggers e Views** para relatórios automáticos
- **Índices** para performance
- **Sistema de logs** completo

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- MySQL 8.0+
- Redis 6.0+ (opcional, para cache)

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/flig.git
cd flig/flig-mvp
```

### 2. Configure o Backend
```bash
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Configure o Banco de Dados
```bash
# Crie o banco de dados
mysql -u root -p
CREATE DATABASE flig_db;

# Execute o schema
mysql -u root -p flig_db < database/schema.sql

# Execute os seeds (opcional)
mysql -u root -p flig_db < database/seed.sql
```

### 4. Configure o Frontend
```bash
cd ../frontend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com a URL da API
```

### 5. Execute a Aplicação
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 📚 Documentação da API

### Autenticação
Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <jwt_token>
```

### Endpoints Principais

#### Autenticação
- `POST /api/auth/register/user` - Registro de cliente
- `POST /api/auth/register/establishment` - Registro de estabelecimento
- `POST /api/auth/login/user` - Login de cliente
- `POST /api/auth/login/establishment` - Login de estabelecimento
- `GET /api/auth/me` - Dados do usuário atual
- `POST /api/auth/logout` - Logout

#### Filas
- `POST /api/queues` - Criar fila (estabelecimento)
- `GET /api/queues/:id` - Buscar fila por ID
- `GET /api/queues/establishment/:id` - Filas de um estabelecimento
- `POST /api/queues/:id/join` - Entrar na fila (cliente)
- `POST /api/queues/:id/advance` - Avançar na fila (cliente)
- `GET /api/queues/:id/clients` - Listar clientes da fila

#### Estabelecimentos
- `GET /api/establishments` - Listar estabelecimentos ativos
- `GET /api/establishments/:id` - Buscar estabelecimento
- `GET /api/establishments/:id/queues` - Filas do estabelecimento
- `GET /api/establishments/stats` - Estatísticas (estabelecimento)
- `GET /api/establishments/queues` - Filas do estabelecimento logado

#### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/stats` - Estatísticas do usuário
- `GET /api/users/queue-history` - Histórico de filas

## 🧪 Testes

### Executar Testes
```bash
cd backend
npm test

# Testes específicos
npm test -- --grep "Authentication"
npm test -- --grep "Queue"
```

### Cobertura de Testes
- ✅ Autenticação (login, registro, JWT)
- ✅ Filas (criação, entrada, avanço)
- ✅ Validação de dados
- ✅ Middleware de segurança
- ✅ Sistema de pagamentos

## 🔒 Segurança

### Implementado
- **JWT Authentication** com expiração
- **Validação de Dados** em todas as entradas
- **Rate Limiting** por IP e usuário
- **Sanitização** de parâmetros
- **Criptografia** de senhas (bcrypt)
- **Validação** de CPF/CNPJ
- **Middleware** de autenticação
- **Logs** de segurança

### Recomendações para Produção
- Configurar HTTPS
- Implementar CORS adequadamente
- Usar variáveis de ambiente para secrets
- Configurar firewall
- Implementar monitoramento
- Backup automático do banco

## 💳 Sistema de Pagamentos

### Status Atual
- ✅ **Simulação completa** de pagamentos
- ✅ **Validação de cartão** (algoritmo de Luhn)
- ✅ **Múltiplos métodos** (crédito, débito, PIX)
- ✅ **Histórico de transações**
- ✅ **Estatísticas financeiras**

### Integração Real
Para produção, substitua o serviço simulado por:
- **PagSeguro** - Gateway brasileiro
- **Mercado Pago** - Popular no Brasil
- **Stripe** - Internacional
- **PayPal** - Global

## 📱 Notificações

### Implementado
- ✅ **Estrutura completa** para notificações
- ✅ **Múltiplos canais** (in-app, email, SMS, push)
- ✅ **Templates** de notificação
- ✅ **Histórico** de notificações
- ✅ **WebSocket** preparado

### Integração Real
Para produção, configure:
- **SendGrid** ou **AWS SES** para email
- **Twilio** ou **AWS SNS** para SMS
- **Firebase** ou **OneSignal** para push
- **Socket.IO** para notificações em tempo real

## 📊 Monitoramento e Logs

### Logs Implementados
- ✅ **Logs de autenticação** (login, registro)
- ✅ **Logs de filas** (criação, entrada, avanço)
- ✅ **Logs de pagamentos** (sucesso, falha)
- ✅ **Logs de erro** detalhados
- ✅ **Logs de performance**

### Métricas Disponíveis
- Total de usuários registrados
- Filas ativas por estabelecimento
- Receita total e por período
- Tempo médio de espera
- Taxa de conversão de pagamentos

## 🚀 Deploy

### Opções de Deploy

#### Backend
- **Heroku** - Fácil deploy com PostgreSQL
- **AWS EC2** - Controle total
- **DigitalOcean** - VPS acessível
- **Railway** - Deploy automático

#### Frontend
- **Vercel** - Deploy automático
- **Netlify** - CDN global
- **AWS S3 + CloudFront** - Escalável

#### Banco de Dados
- **AWS RDS** - MySQL gerenciado
- **PlanetScale** - MySQL serverless
- **DigitalOcean Managed Database**

### Variáveis de Ambiente Necessárias

#### Backend
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=flig_db
JWT_SECRET=your-super-secret-key
REDIS_URL=redis://localhost:6379
```

#### Frontend
```env
VITE_API_URL=https://api.flig.com
VITE_APP_NAME=Flig
```

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use **ESLint** e **Prettier**
- Siga as **convenções** do projeto
- Escreva **testes** para novas funcionalidades
- Documente **APIs** e componentes
- Use **commits semânticos**

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvedor Principal** - [Seu Nome](https://github.com/seu-usuario)
- **Designer UX/UI** - [Nome do Designer](https://github.com/designer)
- **DevOps** - [Nome do DevOps](https://github.com/devops)

## 📞 Suporte

- **Email**: suporte@flig.com
- **Discord**: [Servidor Flig](https://discord.gg/flig)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/flig/issues)

## 🎯 Roadmap

### Versão 2.0
- [ ] **App Mobile** (React Native)
- [ ] **Integração Real** de pagamentos
- [ ] **Geolocalização** para estabelecimentos
- [ ] **Sistema de Avaliações**
- [ ] **Chat em Tempo Real**
- [ ] **Analytics Avançado**

### Versão 3.0
- [ ] **IA para Previsão** de tempo de espera
- [ ] **Integração com WhatsApp**
- [ ] **Sistema de Fidelidade**
- [ ] **API Pública** para terceiros
- [ ] **Multi-idioma**

---

**Flig** - Transformando a experiência de filas! 🚀

