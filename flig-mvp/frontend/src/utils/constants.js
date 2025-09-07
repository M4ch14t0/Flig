/**
 * Configurações da aplicação
 * Informações básicas sobre a empresa e aplicação
 * Usado em headers, footers e páginas de informação
 */
export const APP_CONFIG = {
  name: 'Flig', // Nome da empresa/aplicação
  slogan: 'Soluções de Agilidade', // Slogan da empresa
  email: 'FligPTI@gmail.com', // Email de contato oficial
  copyright: 'Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados' // Texto de copyright
};

/**
 * Cores do tema da aplicação
 * Define a paleta de cores consistente em toda a interface
 * Usado em componentes, páginas e estilos CSS
 */
export const COLORS = {
  primary: '#0A2A5D', // Azul principal - usado em headers e elementos de destaque
  secondary: '#152E60', // Azul secundário - usado em botões e elementos secundários
  background: '#1a1a1a', // Fundo escuro - usado na maioria das páginas
  backgroundLight: '#f4f4f4', // Fundo claro - usado em páginas específicas
  text: '#ffffff', // Texto branco - usado em fundos escuros
  textSecondary: '#cccccc', // Texto secundário - usado para informações menos importantes
  textDark: '#213547', // Texto escuro - usado em fundos claros
  error: '#ff4444', // Cor de erro - usado para mensagens de erro
  success: '#4CAF50', // Cor de sucesso - usado para mensagens de sucesso
  warning: '#ff9800' // Cor de aviso - usado para mensagens de aviso
};

/**
 * Rotas da aplicação
 * Define todas as URLs disponíveis na aplicação
 * Organizado por seções para facilitar manutenção
 */
export const ROUTES = {
  // Páginas públicas - acessíveis sem autenticação
  home: '/', // Página inicial da aplicação
  faq: '/faq', // Página de perguntas frequentes

  // Autenticação - páginas de login e cadastro
  selectProfile: '/escolha-login', // Página para escolher tipo de usuário
  login: '/login', // Login para clientes
  loginEstab: '/login-estab', // Login para estabelecimentos
  cadastroCliente: '/cadastro-cliente', // Cadastro de clientes
  cadastroEstabelecimento: '/cadastro-estabelecimento', // Cadastro de estabelecimentos

  // Rotas do cliente - acessíveis após login como cliente
  cliente: {
    home: '/cliente/home', // Página inicial do cliente
    estabelecimentos: '/cliente/estabelecimentos', // Lista de estabelecimentos
    minhasFilas: '/cliente/minhas-filas', // Filas que o cliente participa
    perfil: '/cliente/perfil', // Perfil e dados pessoais do cliente
    configuracoes: '/cliente/configuracoes', // Configurações da conta
    pagamento: '/cliente/pagamento' // Página de pagamento
  },

  // Rotas do estabelecimento - acessíveis após login como estabelecimento
  estabelecimento: {
    home: '/estabelecimento/home', // Página inicial do estabelecimento
    dashboard: '/estabelecimento/dashboard', // Dashboard com estatísticas
    gerenciarFilas: '/estabelecimento/gerenciar-filas', // Gerenciamento de filas
    perfil: '/estabelecimento/perfil', // Perfil e dados da empresa
    configuracoes: '/estabelecimento/configuracoes', // Configurações da conta
    planos: '/estabelecimento/planos', // Planos e assinaturas
    pagamento: '/estabelecimento/pagamento' // Página de pagamento
  }
};

/**
 * Tipos de usuário disponíveis na aplicação
 * Usado para controlar acesso e funcionalidades específicas
 */
export const USER_TYPES = {
  CLIENTE: 'cliente', // Usuário que consome serviços
  ESTABELECIMENTO: 'estabelecimento' // Usuário que oferece serviços
};

/**
 * Configurações da API
 * Define parâmetros de conexão com o backend
 * IMPORTANTE: Corrigido de porta 3000 para 5000 para corresponder ao backend
 */
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // URL base da API (corrigida)
  timeout: 10000 // Timeout de 10 segundos para requisições
};

/**
 * Expressões regulares para validação de campos
 * Usado no hook useFormValidation para validar formatos
 */
export const VALIDATIONS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Valida formato de email (exemplo@dominio.com)
  cpf: /^\d{11}$/, // Valida CPF com exatamente 11 dígitos
  cnpj: /^\d{14}$/, // Valida CNPJ com exatamente 14 dígitos
  phone: /^\(\d{2}\) \d{4,5}-\d{4}$/ // Valida telefone no formato (11) 99999-9999
};

/**
 * Mensagens de erro padrão para validação
 * Usado em formulários para exibir erros consistentes
 */
export const ERROR_MESSAGES = {
  required: 'Este campo é obrigatório', // Mensagem para campos obrigatórios
  invalidEmail: 'Email inválido', // Mensagem para email com formato incorreto
  invalidCPF: 'CPF inválido', // Mensagem para CPF com formato incorreto
  invalidCNPJ: 'CNPJ inválido', // Mensagem para CNPJ com formato incorreto
  invalidPhone: 'Telefone inválido', // Mensagem para telefone com formato incorreto
  loginFailed: 'Email ou senha incorretos', // Mensagem para falha no login
  networkError: 'Erro de conexão. Tente novamente.', // Mensagem para erros de rede
  serverError: 'Erro no servidor. Tente novamente mais tarde.' // Mensagem para erros do servidor
};

/**
 * Configurações de paginação
 * Define limites padrão para listas paginadas
 */
export const PAGINATION = {
  defaultPageSize: 10, // Número padrão de itens por página
  maxPageSize: 50 // Número máximo de itens por página
};

/**
 * Configurações de notificações
 * Define comportamento padrão das notificações do sistema
 */
export const NOTIFICATIONS = {
  duration: 5000, // Duração em milissegundos (5 segundos)
  position: 'top-right' // Posição na tela (canto superior direito)
};
