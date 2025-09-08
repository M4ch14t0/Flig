# Flig MVP - Sistema de Gerenciamento de Filas

Sistema completo de gerenciamento de filas para estabelecimentos comerciais, desenvolvido com React e Node.js.

## 🚀 Funcionalidades

### Para Clientes
- Cadastro e login de usuários
- Visualização de estabelecimentos
- Entrada em filas
- Acompanhamento de posição na fila
- Gerenciamento de perfil

### Para Estabelecimentos
- Cadastro e login de empresas
- Criação e gerenciamento de filas
- Dashboard com métricas
- Controle de clientes em fila
- Planos de assinatura

## 🛠️ Tecnologias

### Frontend
- **React 19** - Framework principal
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Lucide React** - Ícones
- **Axios** - Cliente HTTP
- **CSS Modules** - Estilização

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **MySQL2** - Banco de dados
- **CORS** - Cross-origin requests
- **dotenv** - Variáveis de ambiente

## 📁 Estrutura do Projeto

```
flig-mvp/
├── backend/                 # API Node.js
│   ├── config/             # Configurações
│   │   └── db.js          # Conexão com banco
│   ├── src/               # Código fonte
│   │   ├── controllers/   # Controladores
│   │   ├── models/        # Modelos de dados
│   │   ├── routes/        # Rotas da API
│   │   └── middlewares/   # Middlewares
│   ├── server.js          # Servidor principal
│   └── package.json       # Dependências backend
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Contextos React
│   │   ├── hooks/         # Hooks customizados
│   │   ├── services/      # Serviços (API)
│   │   ├── styles/        # Estilos globais
│   │   └── utils/         # Utilitários
│   ├── public/            # Arquivos estáticos
│   └── package.json       # Dependências frontend
└── README.md              # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

### 1. Configurar Banco de Dados
```sql
CREATE DATABASE fligdb;
```

### 2. Backend
```bash
cd backend
npm install
npm start
```
O backend estará rodando em `http://localhost:5000`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend estará rodando em `http://localhost:3000`

## 🔧 Scripts Disponíveis

### Backend
- `npm start` - Inicia o servidor
- `npm run dev` - Inicia com nodemon (desenvolvimento)

### Frontend
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run lint` - Verifica código com ESLint
- `npm run lint:fix` - Corrige problemas de linting
- `npm run preview` - Preview do build

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend/`:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=fligdb
DB_PORT=3306

# Servidor
PORT=5000
NODE_ENV=development

# APIs Externas
CNPJA_TOKEN=seu_token_cnpja
```

## 📊 Endpoints da API

### Autenticação
- `POST /api/cadastrar-usuario` - Cadastro de usuário
- `POST /api/empresa` - Cadastro de empresa

### Validações
- `POST /api/cpf` - Validação de CPF
- `GET /api/cnpj/:cnpj` - Consulta CNPJ

### Utilitários
- `GET /health` - Health check
- `GET /api/usuarios` - Lista usuários

## 🎨 Padrões de Código

- **ESLint** configurado com regras de qualidade
- **CSS Modules** para evitar conflitos de estilo
- **Componentes funcionais** com hooks
- **Imports organizados** e sem duplicações
- **Tratamento de erros** consistente

## 🔄 Modo de Desenvolvimento

O projeto está configurado para funcionar em modo de desenvolvimento com:
- Autenticação mock (sem backend real)
- Dados salvos no localStorage
- Validações client-side
- Simulação de delays de rede

Para ativar o modo de produção, altere `USE_MOCK_AUTH = false` no `AuthContext.jsx`.

## 🚀 Próximos Passos

- [ ] Implementar autenticação JWT real
- [ ] Adicionar testes unitários
- [ ] Implementar notificações toast
- [ ] Adicionar sistema de pagamentos
- [ ] Implementar push notifications
- [ ] Adicionar métricas avançadas

## 📝 Licença

Este projeto é privado e proprietário da Flig.

## 👥 Equipe

Desenvolvido pela equipe Flig para revolucionar o gerenciamento de filas.
