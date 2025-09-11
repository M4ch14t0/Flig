# Backend Flig - Sistema de Filas Virtuais

Este é o backend completo do sistema Flig, uma aplicação web de gerenciamento de filas virtuais com sistema de pagamento para avanço de posições.

## 🚀 Funcionalidades

### Sistema de Filas
- ✅ Criação de filas para estabelecimentos
- ✅ Entrada de clientes nas filas
- ✅ Avanço de posições via pagamento (simulado)
- ✅ Consulta de posição na fila
- ✅ Gerenciamento de filas (pausar, encerrar)
- ✅ Relatórios e estatísticas

### Tecnologias Utilizadas
- **Node.js** + **Express.js** - Servidor web
- **MySQL** - Banco de dados persistente
- **Redis** - Cache e filas em memória (ZSET)
- **AES-256-GCM** - Criptografia de dados sensíveis
- **UUID v4** - Identificadores únicos

## 📁 Estrutura do Projeto

```
backend/
├── controllers/          # Controllers das rotas
│   └── queueController.js
├── models/              # Models de dados
│   └── Queue.js
├── routes/              # Definição das rotas REST
│   └── queueRoutes.js
├── services/            # Serviços (Redis, Pagamento)
│   ├── redis.js
│   └── payment.js
├── utils/               # Utilitários (Criptografia, UUID)
│   ├── crypto.js
│   └── uuid.js
├── database/            # Schema e dados de teste
│   ├── schema.sql
│   └── seed.sql
├── config/              # Configurações
│   └── db.js
├── server.js            # Servidor principal
└── package.json         # Dependências
```

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos
- Node.js (v16 ou superior)
- MySQL (v8.0 ou superior)
- Redis (v6.0 ou superior)

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Configuração do Banco de Dados
```bash
# Criar banco de dados
mysql -u root -p < database/schema.sql

# Inserir dados de teste
mysql -u root -p fligdb < database/seed.sql
```

### 4. Configuração do Redis
```bash
# Instalar Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 5. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do backend:

```env
# Servidor
PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=fligdb
DB_PORT=3306

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Criptografia
ENCRYPTION_KEY=flig-encryption-key-32-chars-long!!

# CNPJá API
CNPJA_TOKEN=seu_token_aqui
```

### 6. Executar o Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📋 API Endpoints

### Filas
- `POST /api/queues` - Criar fila
- `GET /api/queues/establishment/:id` - Listar filas do estabelecimento
- `GET /api/queues/:id` - Buscar fila por ID
- `POST /api/queues/:id/join` - Entrar na fila
- `POST /api/queues/:id/advance` - Avançar na fila (pagamento)
- `GET /api/queues/:id/position/:clientId` - Consultar posição
- `GET /api/queues/:id/clients` - Listar clientes da fila
- `DELETE /api/queues/:id/clients/:clientId` - Remover cliente
- `PUT /api/queues/:id/status` - Atualizar status da fila
- `DELETE /api/queues/:id` - Encerrar fila
- `GET /api/queues/:id/stats` - Estatísticas da fila

### Outros Endpoints
- `GET /health` - Health check
- `GET /api/cnpj/:cnpj` - Consultar CNPJ
- `POST /api/cpf` - Validar CPF
- `GET /api/usuarios` - Listar usuários
- `POST /api/cadastrar-usuario` - Cadastrar usuário
- `POST /api/empresa` - Cadastrar empresa

## 🔧 Como Funciona o Sistema de Filas

### Redis ZSET (Sorted Set)
O sistema utiliza Redis ZSET para implementar as filas:

- **Score**: Posição na fila (menor = mais próximo do atendimento)
- **Member**: Dados criptografados do cliente
- **Operações**: ZADD, ZRANGE, ZREM, ZRANK, ZCARD

### Fluxo de Funcionamento

1. **Criação da Fila**
   - Estabelecimento cria fila via API
   - Dados salvos no MySQL (persistência)
   - Metadados armazenados no Redis

2. **Entrada do Cliente**
   - Cliente entra na fila via API
   - Dados pessoais criptografados com AES-256-GCM
   - Cliente adicionado ao ZSET com próxima posição

3. **Avanço de Posições**
   - Cliente escolhe quantas posições avançar (1-8)
   - Sistema simula pagamento
   - Cliente movido para nova posição no ZSET

4. **Consulta de Posição**
   - Cliente consulta posição atual
   - Sistema calcula tempo estimado de espera

5. **Gerenciamento**
   - Estabelecimento pode pausar/encerrar fila
   - Visualiza clientes (dados descriptografados)
   - Acessa relatórios e estatísticas

## 🔐 Segurança

### Criptografia
- **AES-256-GCM** para dados sensíveis
- Dados pessoais criptografados antes de armazenar no Redis
- Chave de criptografia configurável via variável de ambiente

### Validações
- Validação de CPF usando algoritmo oficial
- Validação de CNPJ via API externa
- Validação de dados de cartão (algoritmo de Luhn)

### Performance
- Redis para operações rápidas de fila
- MySQL apenas para dados persistentes
- Índices otimizados para consultas frequentes

## 💳 Sistema de Pagamento

### Simulação Atual
O sistema atualmente simula pagamentos para testes:

- Validação de dados do cartão
- Simulação de processamento (1-3 segundos)
- Taxa de sucesso de 95%
- Geração de IDs de transação únicos

### Integração Futura
Para produção, substitua as funções em `services/payment.js`:

```javascript
// Substituir por chamadas reais às APIs:
// - PagSeguro
// - Mercado Pago
// - Stripe
// - etc.
```

## 📊 Dados de Teste

O arquivo `database/seed.sql` inclui:

- **8 usuários** fictícios
- **4 estabelecimentos** (Restaurante, Barbearia, Clínica, Academia)
- **8 filas** ativas
- **10 transações** de pagamento
- **10 registros** de histórico
- **8 relatórios** diários
- **8 logs** do sistema

## 🚀 Deploy para VPS

### Preparação
1. Configure variáveis de ambiente para produção
2. Instale MySQL e Redis no VPS
3. Execute schema.sql no servidor
4. Configure SSL/HTTPS
5. Configure firewall e segurança

### Comandos de Deploy
```bash
# Instalar PM2 para gerenciamento de processos
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name "flig-backend"

# Configurar para iniciar automaticamente
pm2 startup
pm2 save
```

## 🐛 Troubleshooting

### Redis não conecta
```bash
# Verificar se Redis está rodando
redis-cli ping

# Verificar logs do Redis
sudo journalctl -u redis-server
```

### MySQL não conecta
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u root -p -e "SHOW DATABASES;"
```

### Erro de permissões
```bash
# Dar permissões corretas
sudo chown -R $USER:$USER /caminho/do/projeto
chmod -R 755 /caminho/do/projeto
```

## 📝 Logs

O sistema gera logs em:
- Console do servidor
- Tabela `logs_sistema` no MySQL
- Logs do Redis (se configurado)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@flig.com.br
- Issues: GitHub Issues
- Documentação: README.md

---

**Desenvolvido com ❤️ pela equipe Flig**

