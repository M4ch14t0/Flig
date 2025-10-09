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
    // Detecta o tipo de usuário baseado na URL da requisição
    const url = config.url || '';
    let userType = null;
    
    if (url.includes('/users/') || url.includes('/cliente/')) {
      userType = 'cliente';
    } else if (url.includes('/establishments/') || url.includes('/estabelecimento/') || url.includes('/queues/establishment')) {
      userType = 'estabelecimento';
    }
    
    // Se não conseguiu detectar pela URL, tenta detectar pela página atual
    if (!userType) {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/cliente/')) {
        userType = 'cliente';
      } else if (currentPath.includes('/estabelecimento/')) {
        userType = 'estabelecimento';
      }
    }
    
    // Se ainda não conseguiu detectar, tenta detectar pelos dados existentes
    if (!userType) {
      const clienteToken = localStorage.getItem('token_cliente');
      const estabToken = localStorage.getItem('token_estabelecimento');
      
      if (estabToken) {
        userType = 'estabelecimento';
      } else if (clienteToken) {
        userType = 'cliente';
      }
    }
    
    if (userType) {
      const token = localStorage.getItem(`token_${userType}`);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 Token adicionado para ${userType}:`, token.substring(0, 20) + '...');
      } else {
        console.warn(`⚠️ Token não encontrado para ${userType}`);
      }
    } else {
      console.warn('⚠️ Tipo de usuário não detectado para a requisição:', url);
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
    // Se receber 401 (não autorizado), verifica se é um problema de token inválido
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      
      // Só limpa os dados se for um problema de token inválido ou expirado
      if (errorMessage.includes('Token inválido') || 
          errorMessage.includes('Token expirado') ||
          errorMessage.includes('Token não fornecido')) {
        
        // Detecta o tipo de usuário baseado na URL da requisição
        const url = error.config?.url || '';
        let userType = null;
        
        if (url.includes('/users/') || url.includes('/cliente/')) {
          userType = 'cliente';
        } else if (url.includes('/establishments/') || url.includes('/estabelecimento/')) {
          userType = 'estabelecimento';
        }
        
        // Se conseguiu detectar o tipo, limpa apenas esse tipo
        if (userType) {
          localStorage.removeItem(`token_${userType}`);
          localStorage.removeItem(`userType_${userType}`);
          localStorage.removeItem(`userEmail_${userType}`);
          localStorage.removeItem(`userName_${userType}`);
          localStorage.removeItem(`userId_${userType}`);
        } else {
          // Se não conseguiu detectar, limpa ambos os tipos
          ['cliente', 'estabelecimento'].forEach(type => {
            localStorage.removeItem(`token_${type}`);
            localStorage.removeItem(`userType_${type}`);
            localStorage.removeItem(`userEmail_${type}`);
            localStorage.removeItem(`userName_${type}`);
            localStorage.removeItem(`userId_${type}`);
          });
        }

        // Redireciona para login se estiver em uma página protegida
        if (window.location.pathname.includes('/cliente/') ||
            window.location.pathname.includes('/estabelecimento/')) {
          window.location.href = '/escolha-login';
        }
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
    const response = await api.get('/api/health');
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
    const response = await api.get('/api/auth/me');
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
    return api.post('/api/auth/login/user', {
      email_usuario: credentials.email,
      senha_usuario: credentials.password,
    });
  } else {
    return api.post('/api/auth/login/establishment', {
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
    return api.post('/api/auth/register/user', userData);
  } else {
    return api.post('/api/auth/register/establishment', userData);
  }
};

/**
 * Logout de usuário
 * @returns {Promise<Object>}
 */
export const logoutUser = async () => {
  return api.post('/api/auth/logout');
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
  return api.get('/api/estabelecimentos', { params: filters });
};

/**
 * Obter detalhes de um estabelecimento
 * @param {number} id - ID do estabelecimento
 * @returns {Promise<Object>}
 */
export const getEstablishmentById = async (id) => {
  return api.get(`/api/establishments/${id}`);
};

// ========================================
// ENDPOINTS DE FILAS
// ========================================

/**
 * Listar filas do usuário
 * @returns {Promise<Object>}
 */
export const getUserQueues = async () => {
  return api.get('/api/queues/user');
};

/**
 * Entrar em uma fila
 * @param {number} establishmentId - ID do estabelecimento
 * @returns {Promise<Object>}
 */
export const joinQueue = async (establishmentId) => {
  return api.post('/api/queues/join', { establishmentId });
};

/**
 * Sair de uma fila
 * @param {number} queueId - ID da fila
 * @returns {Promise<Object>}
 */
export const leaveQueue = async (queueId) => {
  return api.post('/api/queues/leave', { queueId });
};

// ========================================
// ENDPOINTS DE ESTABELECIMENTO (GERENCIAMENTO)
// ========================================

/**
 * Listar filas do estabelecimento
 * @returns {Promise<Object>}
 */
export const getEstablishmentQueues = async () => {
  return api.get('/api/establishment/queues');
};

/**
 * Criar nova fila
 * @param {Object} queueData - Dados da fila
 * @returns {Promise<Object>}
 */
export const createQueue = async (queueData) => {
  return api.post('/api/establishment/queues', queueData);
};

/**
 * Atualizar fila
 * @param {number} queueId - ID da fila
 * @param {Object} queueData - Dados da fila
 * @returns {Promise<Object>}
 */
export const updateQueue = async (queueId, queueData) => {
  return api.put(`/api/establishment/queues/${queueId}`, queueData);
};

/**
 * Deletar fila
 * @param {number} queueId - ID da fila
 * @returns {Promise<Object>}
 */
export const deleteQueue = async (queueId) => {
  return api.delete(`/api/establishment/queues/${queueId}`);
};

// ========================================
// EXPORT DEFAULT
// ========================================
export default api;

