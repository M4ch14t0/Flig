# Estrutura Atual do Projeto Flig MVP

## Visão Geral

O projeto mantém o design original com headers e sidebars próprios para cada página, garantindo consistência visual e funcionalidade adequada.

## Estrutura de Páginas

### Páginas de Cliente

#### 1. UserHome (`/cliente/home`)
- **Arquivo**: `src/pages/cliente/UserHome/UserHome.jsx`
- **Design**: Header azul com logo e ícones, sidebar lateral, conteúdo centralizado
- **Navegação**: Home, Estabelecimentos, Minhas Filas
- **Funcionalidade**: Página de boas-vindas

#### 2. Estabelecimentos (`/cliente/estabelecimentos`)
- **Arquivo**: `src/pages/cliente/Estabelecimentos/Estabelecimentos.jsx`
- **Design**: Header azul, sidebar lateral, grid de cards de estabelecimentos
- **Funcionalidades**: 
  - Busca por nome
  - Filtros por avaliação
  - Paginação
  - Cards com informações dos estabelecimentos

#### 3. MinhasFilas (`/cliente/minhas-filas`)
- **Arquivo**: `src/pages/cliente/MinhasFilas/MinhasFilas.jsx`
- **Design**: Header azul, sidebar lateral, lista de filas ativas
- **Funcionalidades**: Visualizar filas ativas, sair de filas, avançar posições

#### 4. ContaU (`/cliente/perfil`)
- **Arquivo**: `src/pages/cliente/ContaU/ContaU.jsx`
- **Design**: Header azul, formulário de dados pessoais
- **Funcionalidades**: Editar dados pessoais, alterar email

#### 5. ConfigU (`/cliente/configuracoes`)
- **Arquivo**: `src/pages/cliente/ConfigU/ConfigU.jsx`
- **Design**: Header azul, configurações em cards
- **Funcionalidades**: Tema, notificações, links úteis

### Páginas de Estabelecimento

#### 1. EstHome (`/estabelecimento/home`)
- **Arquivo**: `src/pages/estabelecimento/EstHome/EstHome.jsx`
- **Design**: Header azul com logo e ícones, sidebar lateral
- **Navegação**: Home, Gerenciar Filas, Planos
- **Funcionalidade**: Página de boas-vindas

#### 2. ContaE (`/estabelecimento/perfil`)
- **Arquivo**: `src/pages/estabelecimento/ContaE/ContaE.jsx`
- **Design**: Header azul, formulário de dados da empresa
- **Funcionalidades**: Editar dados da empresa, avatar

#### 3. ConfigE (`/estabelecimento/configuracoes`)
- **Arquivo**: `src/pages/estabelecimento/ConfigE/ConfigE.jsx`
- **Design**: Header azul, configurações em cards
- **Funcionalidades**: Tema, exportar dados

#### 4. Plano (`/estabelecimento/planos`)
- **Arquivo**: `src/pages/estabelecimento/Planos/Plano.jsx`
- **Design**: Header azul, sidebar lateral, cards de planos
- **Funcionalidades**: Visualizar e escolher planos

## Padrões de Design

### Cores Principais
- **Azul Principal**: `#0A2A5D` (Header e Sidebar)
- **Azul Secundário**: `#152E60` (Elementos de destaque)
- **Fundo Escuro**: `#1a1a1a` (Conteúdo principal)
- **Fundo Claro**: `#f4f4f4` (Algumas páginas)

### Estrutura Comum
1. **Header**: Logo à esquerda, ícones à direita
2. **Sidebar**: Menu lateral com navegação
3. **Main**: Área de conteúdo principal
4. **Responsividade**: Adaptação para diferentes telas

### Componentes Reutilizáveis
- **Ícones**: Lucide React para consistência
- **Navegação**: React Router para roteamento
- **Formulários**: Validação e estados consistentes

## Padrões de Código

### Estrutura de Arquivos
```
src/pages/
├── cliente/
│   ├── UserHome/
│   │   ├── UserHome.jsx
│   │   └── UserHome.module.css
│   ├── Estabelecimentos/
│   ├── MinhasFilas/
│   ├── ContaU/
│   └── ConfigU/
└── estabelecimento/
    ├── EstHome/
    ├── ContaE/
    ├── ConfigE/
    └── Planos/
```

### Convenções de Nomenclatura
- **Componentes**: PascalCase (ex: `UserHome.jsx`)
- **CSS Modules**: `ComponentName.module.css`
- **Classes CSS**: kebab-case (ex: `user-home-container`)
- **Variáveis**: camelCase (ex: `userHome`)

### Comentários
- **Seções principais**: Comentários descritivos
- **Funções**: Explicação do propósito
- **Lógica complexa**: Comentários explicativos

## Navegação

### Rotas de Cliente
- `/cliente/home` - Página inicial
- `/cliente/estabelecimentos` - Lista de estabelecimentos
- `/cliente/minhas-filas` - Filas do usuário
- `/cliente/perfil` - Perfil do usuário
- `/cliente/configuracoes` - Configurações

### Rotas de Estabelecimento
- `/estabelecimento/home` - Página inicial
- `/estabelecimento/perfil` - Perfil do estabelecimento
- `/estabelecimento/configuracoes` - Configurações
- `/estabelecimento/planos` - Planos disponíveis
- `/estabelecimento/gerenciar-filas` - Gerenciar filas

## Manutenção

### Para Adicionar Novas Páginas
1. Criar pasta em `src/pages/cliente/` ou `src/pages/estabelecimento/`
2. Criar arquivo `.jsx` e `.module.css`
3. Seguir padrão de header e sidebar existente
4. Usar `useNavigate` para navegação
5. Adicionar rota em `AppRoutes.jsx`

### Para Modificar Design
1. Manter cores e estrutura existentes
2. Testar responsividade
3. Verificar consistência com outras páginas
4. Documentar mudanças

### Performance
- Usar CSS Modules para evitar conflitos
- Lazy loading para componentes grandes
- Otimizar imagens e assets
- Minimizar re-renders desnecessários

## Dependências Principais
- **React Router**: Navegação
- **Lucide React**: Ícones
- **CSS Modules**: Estilização
- **Vite**: Build tool

## Estrutura de Dados
- **Estabelecimentos**: Mock data com id, nome, nota, avaliações, filas, pessoas
- **Filas**: Mock data com id, estabelecimento, fila, pessoas, posição
- **Usuários**: Formulários com validação

## Validações
- **Email**: Regex para formato válido
- **CPF**: 11 dígitos numéricos
- **CNPJ**: 14 dígitos numéricos
- **Campos obrigatórios**: Verificação de preenchimento 