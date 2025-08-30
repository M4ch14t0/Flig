import axios from 'axios';

/**
 * Configuração base da API usando Axios
 * Cria uma instância do Axios com configurações padrão
 */
const api = axios.create({
  // Define a URL base da API - usa variável de ambiente ou fallback para localhost:5000
  // Corrigido de 3000 para 5000 para corresponder ao backend
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // Timeout de 10 segundos para evitar requisições pendentes indefinidamente
  timeout: 10000,
  // Define o tipo de conteúdo padrão como JSON
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição - executa ANTES de cada requisição HTTP
 * Adiciona automaticamente o token de autenticação em todas as requisições
 */
api.interceptors.request.use(
  (config) => {
    // Busca o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');
    
    // Se existir um token, adiciona no header Authorization
    if (token) {
      // Formato: "Bearer <token>" - padrão JWT
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Retorna a configuração modificada
    return config;
  },
  (error) => {
    // Se houver erro na configuração da requisição, rejeita a Promise
    return Promise.reject(error);
  }
);

/**
 * Interceptor de resposta - executa APÓS cada resposta HTTP
 * Trata automaticamente erros de autenticação e redireciona se necessário
 */
api.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida, retorna normalmente
    return response;
  },
  (error) => {
    // Se receber erro 401 (não autorizado) - token expirado ou inválido
    if (error.response?.status === 401) {
      // Remove dados de autenticação do localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      
      // Redireciona para a página de escolha de login
      window.location.href = '/escolha-login';
    }
    
    // Rejeita a Promise com o erro para tratamento posterior
    return Promise.reject(error);
  }
);

/**
 * Serviços de autenticação
 * Funções para login, registro e logout de usuários
 */
export const authService = {
  // Faz login do usuário enviando credenciais para /auth/login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Registra novo usuário enviando dados para /auth/register
  register: (userData) => api.post('/auth/register', userData),
  
  // Faz logout do usuário enviando requisição para /auth/logout
  logout: () => api.post('/auth/logout'),
};

/**
 * Serviços do usuário cliente
 * Funções para gerenciar perfil, estabelecimentos e filas do usuário
 */
export const userService = {
  // Busca perfil do usuário logado
  getProfile: () => api.get('/user/profile'),
  
  // Atualiza dados do perfil do usuário
  updateProfile: (data) => api.put('/user/profile', data),
  
  // Lista todos os estabelecimentos disponíveis
  getEstablishments: () => api.get('/establishments'),
  
  // Busca dados de um estabelecimento específico por ID
  getEstablishment: (id) => api.get(`/establishments/${id}`),
  
  // Lista filas que o usuário está participando
  getMyQueues: () => api.get('/user/queues'),
  
  // Entra em uma fila de um estabelecimento específico
  joinQueue: (establishmentId) => api.post(`/establishments/${establishmentId}/join`),
  
  // Sai de uma fila específica
  leaveQueue: (queueId) => api.delete(`/queues/${queueId}`),
};

/**
 * Serviços do estabelecimento
 * Funções para gerenciar perfil, filas e planos do estabelecimento
 */
export const establishmentService = {
  // Busca perfil do estabelecimento logado
  getProfile: () => api.get('/establishment/profile'),
  
  // Atualiza dados do perfil do estabelecimento
  updateProfile: (data) => api.put('/establishment/profile', data),
  
  // Lista todas as filas do estabelecimento
  getQueues: () => api.get('/establishment/queues'),
  
  // Busca dados de uma fila específica por ID
  getQueue: (id) => api.get(`/establishment/queues/${id}`),
  
  // Cria uma nova fila no estabelecimento
  createQueue: (data) => api.post('/establishment/queues', data),
  
  // Atualiza dados de uma fila existente
  updateQueue: (id, data) => api.put(`/establishment/queues/${id}`, data),
  
  // Remove uma fila do estabelecimento
  deleteQueue: (id) => api.delete(`/establishment/queues/${id}`),
  
  // Lista planos disponíveis para o estabelecimento
  getPlans: () => api.get('/establishment/plans'),
  
  // Inscreve o estabelecimento em um plano específico
  subscribePlan: (planId) => api.post(`/establishment/plans/${planId}/subscribe`),
};

// Exporta a instância da API como padrão
export default api;
