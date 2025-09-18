import axios from 'axios';

// ========================================
// CONFIGURAÇÃO DA API
// ========================================
// URL base do backend - ajuste conforme necessário
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========================================
// INSTÂNCIA DO AXIOS
// ========================================
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================
// INTERCEPTORS
// ========================================

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se receber 401 (não autorizado), limpa os dados de autenticação
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');

      // Redireciona para login se estiver em uma página protegida
      if (window.location.pathname.includes('/cliente/') ||
          window.location.pathname.includes('/estabelecimento/')) {
        window.location.href = '/escolha-login';
      }
    }

    return Promise.reject(error);
  }
);

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Função para verificar se o backend está disponível
 * @returns {Promise<boolean>}
 */
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend não está disponível:', error);
    return false;
  }
};

/**
 * Função para obter dados do usuário atual
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    throw error;
  }
};

// ========================================
// ENDPOINTS DE AUTENTICAÇÃO
// ========================================

/**
 * Login de usuário
 * @param {Object} credentials - Email e senha
 * @param {string} userType - Tipo de usuário
 * @returns {Promise<Object>}
 */
export const loginUser = async (credentials, userType) => {
  if (userType === 'cliente') {
    return api.post('/auth/login/user', {
      email_usuario: credentials.email,
      senha_usuario: credentials.password,
    });
  } else {
    return api.post('/auth/login/establishment', {
      email_empresa: credentials.email,
      senha_empresa: credentials.password,
    });
  }
};

/**
 * Registro de usuário
 * @param {Object} userData - Dados do usuário
 * @param {string} userType - Tipo de usuário
 * @returns {Promise<Object>}
 */
export const registerUser = async (userData, userType) => {
  if (userType === 'cliente') {
    return api.post('/auth/register/user', userData);
  } else {
    return api.post('/auth/register/establishment', userData);
  }
};

/**
 * Logout de usuário
 * @returns {Promise<Object>}
 */
export const logoutUser = async () => {
  return api.post('/auth/logout');
};

// ========================================
// ENDPOINTS DE ESTABELECIMENTOS
// ========================================

/**
 * Listar estabelecimentos
 * @param {Object} filters - Filtros de busca
 * @returns {Promise<Object>}
 */
export const getEstablishments = async (filters = {}) => {
  return api.get('/estabelecimentos', { params: filters });
};

/**
 * Obter detalhes de um estabelecimento
 * @param {number} id - ID do estabelecimento
 * @returns {Promise<Object>}
 */
export const getEstablishmentById = async (id) => {
  return api.get(`/establishments/${id}`);
};

// ========================================
// ENDPOINTS DE FILAS
// ========================================

/**
 * Listar filas do usuário
 * @returns {Promise<Object>}
 */
export const getUserQueues = async () => {
  return api.get('/queues/user');
};

/**
 * Entrar em uma fila
 * @param {number} establishmentId - ID do estabelecimento
 * @returns {Promise<Object>}
 */
export const joinQueue = async (establishmentId) => {
  return api.post('/queues/join', { establishmentId });
};

/**
 * Sair de uma fila
 * @param {number} queueId - ID da fila
 * @returns {Promise<Object>}
 */
export const leaveQueue = async (queueId) => {
  return api.post('/queues/leave', { queueId });
};

// ========================================
// ENDPOINTS DE ESTABELECIMENTO (GERENCIAMENTO)
// ========================================

/**
 * Listar filas do estabelecimento
 * @returns {Promise<Object>}
 */
export const getEstablishmentQueues = async () => {
  return api.get('/establishment/queues');
};

/**
 * Criar nova fila
 * @param {Object} queueData - Dados da fila
 * @returns {Promise<Object>}
 */
export const createQueue = async (queueData) => {
  return api.post('/establishment/queues', queueData);
};

/**
 * Atualizar fila
 * @param {number} queueId - ID da fila
 * @param {Object} queueData - Dados da fila
 * @returns {Promise<Object>}
 */
export const updateQueue = async (queueId, queueData) => {
  return api.put(`/establishment/queues/${queueId}`, queueData);
};

/**
 * Deletar fila
 * @param {number} queueId - ID da fila
 * @returns {Promise<Object>}
 */
export const deleteQueue = async (queueId) => {
  return api.delete(`/establishment/queues/${queueId}`);
};

// ========================================
// EXPORT DEFAULT
// ========================================
export default api;
