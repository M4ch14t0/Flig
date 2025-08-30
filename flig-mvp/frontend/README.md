# Flig MVP - Frontend

## Visão Geral

Este é o frontend do projeto Flig MVP, uma aplicação React moderna para gerenciamento de filas e estabelecimentos.

## 🚀 Melhorias Implementadas

### Estrutura e Organização
- ✅ **Sistema de Autenticação**: Implementado contexto de autenticação com `useAuth` hook
- ✅ **Rotas Protegidas**: Componente `ProtectedRoute` para proteger páginas que requerem autenticação
- ✅ **Configuração de API**: Serviços centralizados com interceptors para tratamento de erros
- ✅ **Constantes Centralizadas**: Arquivo de constantes para configurações e valores reutilizáveis
- ✅ **Validação de Formulários**: Hook personalizado `useFormValidation` para validação consistente

### Componentes e Reutilização
- ✅ **Layout Component**: Componente reutilizável para header, sidebar e footer
- ✅ **Padronização CSS**: Migração para CSS Modules para evitar conflitos
- ✅ **Componente Button**: Botão reutilizável com estilos consistentes
- ✅ **Eliminação de Redundâncias**: Remoção de código duplicado em páginas

### Qualidade de Código
- ✅ **ESLint Configurado**: Regras de linting para manter qualidade do código
- ✅ **Padronização de Imports**: Imports organizados e sem duplicações
- ✅ **Tratamento de Erros**: Interceptors para tratamento consistente de erros da API
- ✅ **Loading States**: Estados de carregamento para melhor UX

### Segurança e Performance
- ✅ **Autenticação Segura**: Tokens JWT com interceptors automáticos
- ✅ **Redirecionamentos Inteligentes**: Redirecionamento automático após login
- ✅ **Validação de Formulários**: Validação client-side com feedback visual
- ✅ **Lazy Loading**: Preparado para implementação de lazy loading

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.jsx      # Layout principal com header/sidebar
│   ├── Button.jsx      # Botão reutilizável
│   └── ProtectedRoute.jsx # Rota protegida
├── hooks/              # Hooks personalizados
│   ├── useAuth.js      # Hook de autenticação
│   └── useFormValidation.js # Hook de validação
├── services/           # Serviços da API
│   └── api.js         # Configuração e serviços da API
├── utils/              # Utilitários
│   └── constants.js    # Constantes da aplicação
├── pages/              # Páginas da aplicação
│   ├── auth/          # Páginas de autenticação
│   ├── cliente/       # Páginas do cliente
│   └── estabelecimento/ # Páginas do estabelecimento
└── styles/            # Estilos globais
```

## 🛠️ Tecnologias Utilizadas

- **React 19.1.0** - Framework principal
- **React Router 7.7.0** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **CSS Modules** - Estilização modular
- **Vite** - Build tool
- **ESLint** - Linting de código

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000/api
```

### Configuração da API
A API está configurada em `src/services/api.js` com:
- Interceptors para autenticação automática
- Tratamento de erros 401 (logout automático)
- Timeout de 10 segundos
- Headers padrão

## 📋 Funcionalidades

### Autenticação
- Login para clientes e estabelecimentos
- Registro de novos usuários
- Logout automático
- Proteção de rotas

### Cliente
- Visualização de estabelecimentos
- Entrada em filas
- Gerenciamento de filas ativas
- Perfil e configurações

### Estabelecimento
- Dashboard de gerenciamento
- Criação e gerenciamento de filas
- Planos e assinaturas
- Perfil e configurações

## 🎨 Design System

### Cores
- **Primária**: `#0A2A5D`
- **Secundária**: `#152E60`
- **Fundo**: `#1a1a1a`
- **Texto**: `#ffffff`

### Componentes
- Layout consistente com header azul
- Sidebar de navegação
- Botões padronizados
- Formulários com validação

## 🔒 Segurança

- Tokens JWT para autenticação
- Interceptors para renovação automática
- Validação de formulários
- Proteção de rotas por tipo de usuário

## 📱 Responsividade

- Design responsivo para mobile e desktop
- CSS Modules para isolamento de estilos
- Breakpoints definidos para diferentes telas

## 🚀 Próximos Passos

- [ ] Implementar lazy loading para melhor performance
- [ ] Adicionar testes unitários
- [ ] Implementar PWA
- [ ] Adicionar notificações push
- [ ] Melhorar acessibilidade

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
