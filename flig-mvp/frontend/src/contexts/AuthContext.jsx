import { useState, useEffect } from 'react';
import { AuthContext } from './authContextImports.js';

// ========================================
// CONFIGURAÇÃO DE DESENVOLVIMENTO
// ========================================
// Altere esta variável para false quando quiser usar o backend real
const USE_MOCK_AUTH = false;

// ========================================
// IMPORTS PARA BACKEND REAL
// ========================================
import { api } from '../services/api';

/**
 * Provider do contexto de autenticação
 * Componente que envolve a aplicação e fornece dados de autenticação
 * Gerencia o estado global de autenticação (usuário, tipo, loading)
 */
export const AuthProvider = ({ children }) => {
  // Estado para armazenar dados do usuário logado (null = não logado)
  const [user, setUser] = useState(null);

  // Estado para armazenar o tipo de usuário ('cliente' ou 'estabelecimento')
  const [userType, setUserType] = useState(null);

  // Estado para controlar se está carregando dados de autenticação
  const [loading, setLoading] = useState(true);

  /**
   * Função para validar formato do token
   * Verifica se o token existe e é uma string válida
   * @param {string} token - Token a ser validado
   * @returns {boolean} - True se o token for válido, false caso contrário
   */
  const isValidTokenFormat = (token) => {
    if (USE_MOCK_AUTH) {
      return token && typeof token === 'string' && token.startsWith('mock-jwt-token-');
    } else {
      // Para backend real, verifica se é um JWT válido (tem 3 partes separadas por ponto)
      return token && typeof token === 'string' && token.split('.').length === 3;
    }
  };

  /**
   * Função para obter chaves específicas do tipo de usuário
   */
  const getUserKeys = (userType) => ({
    token: `token_${userType}`,
    userType: `userType_${userType}`,
    email: `userEmail_${userType}`,
    name: `userName_${userType}`,
    id: `userId_${userType}`
  });

  /**
   * Função para limpar dados de autenticação de um tipo específico
   * Remove dados do localStorage para o tipo de usuário especificado
   */
  const clearAuthData = (userType = null) => {
    try {
      if (userType) {
        // Limpa dados de um tipo específico
        const keys = getUserKeys(userType);
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.userType);
        localStorage.removeItem(keys.email);
        localStorage.removeItem(keys.name);
        localStorage.removeItem(keys.id);
      } else {
        // Limpa dados de ambos os tipos (compatibilidade)
        ['cliente', 'estabelecimento'].forEach(type => {
          const keys = getUserKeys(type);
          localStorage.removeItem(keys.token);
          localStorage.removeItem(keys.userType);
          localStorage.removeItem(keys.email);
          localStorage.removeItem(keys.name);
          localStorage.removeItem(keys.id);
        });
      }
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }

    // Reseta os estados de autenticação
    setUser(null);
    setUserType(null);
  };

  /**
   * useEffect que executa ao montar o componente
   * Verifica se há um usuário logado ao carregar a aplicação
   * Recupera dados do localStorage e valida a sessão
   */
  // Função para carregar dados de autenticação
  const loadAuthData = () => {
    try {
      console.log('🔄 Carregando dados de autenticação...');
      
      // Detecta o tipo de usuário baseado na URL atual
      const currentPath = window.location.pathname;
      let expectedUserType = null;
      
      if (currentPath.includes('/cliente/')) {
        expectedUserType = 'cliente';
        console.log('📍 Detectado: página de cliente');
      } else if (currentPath.includes('/estabelecimento/')) {
        expectedUserType = 'estabelecimento';
        console.log('📍 Detectado: página de estabelecimento');
      }

      // Se não conseguiu detectar pela URL, tenta detectar pelos dados existentes
      if (!expectedUserType) {
        // Verifica se há dados de cliente
        const clienteKeys = getUserKeys('cliente');
        const clienteToken = localStorage.getItem(clienteKeys.token);
        const clienteType = localStorage.getItem(clienteKeys.userType);
        
        // Verifica se há dados de estabelecimento
        const estabKeys = getUserKeys('estabelecimento');
        const estabToken = localStorage.getItem(estabKeys.token);
        const estabType = localStorage.getItem(estabKeys.userType);
        
        // Prioriza o tipo que tem token válido
        if (clienteToken && clienteType && isValidTokenFormat(clienteToken)) {
          expectedUserType = 'cliente';
        } else if (estabToken && estabType && isValidTokenFormat(estabToken)) {
          expectedUserType = 'estabelecimento';
        }
      }

      if (expectedUserType) {
        const keys = getUserKeys(expectedUserType);
        const token = localStorage.getItem(keys.token);
        const storedUserType = localStorage.getItem(keys.userType);
        const storedEmail = localStorage.getItem(keys.email);
        const storedName = localStorage.getItem(keys.name);
        const storedId = localStorage.getItem(keys.id);

        console.log(`🔍 Verificando dados para ${expectedUserType}:`, {
          hasToken: !!token,
          hasUserType: !!storedUserType,
          hasEmail: !!storedEmail,
          hasName: !!storedName,
          hasId: !!storedId
        });

        // Verifica se existe token e tipo de usuário, e se o token é válido
        if (token && storedUserType && isValidTokenFormat(token)) {
          // Define o tipo de usuário no estado
          setUserType(storedUserType);

          // Cria objeto do usuário com dados armazenados
          const userData = {
            id: parseInt(storedId) || (storedUserType === 'estabelecimento' ? 8 : 1),
            email: storedEmail || 'user@example.com',
            name: storedName || 'Usuário',
            type: storedUserType,
            token,
          };

          console.log('✅ Usuário autenticado:', userData.name, userData.email);

          // Define o usuário no estado
          setUser(userData);
        } else {
          console.warn('⚠️ Dados inválidos, limpando autenticação');
          // Se não há dados válidos para este tipo, limpa apenas este tipo
          clearAuthData(expectedUserType);
        }
      } else {
        console.log('📄 Página pública, sem autenticação necessária');
        // Se não há tipo detectado, não limpa nada (pode estar em página pública)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carrega dados iniciais
    loadAuthData();

    // Listener para mudanças no localStorage (sincronização entre abas)
    const handleStorageChange = (e) => {
      if (e.key && (e.key.startsWith('token_') || e.key.startsWith('userType_'))) {
        // Recarrega dados quando há mudança nos tokens
        loadAuthData();
      }
    };

    // Listener para eventos customizados de login/logout
    const handleAuthChange = (e) => {
      const { type, action } = e.detail || {};
      
      // Só recarrega se for um evento de logout ou se for um login de tipo diferente
      if (action === 'logout' || (action === 'login' && type !== userType)) {
        loadAuthData();
      }
    };

    // Adiciona listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []); // Array vazio = executa apenas uma vez ao montar

  /**
   * Função de login
   * @param {Object} credentials - Objeto com email e senha
   * @param {string} type - Tipo de usuário ('cliente' ou 'estabelecimento')
   * @returns {Object} - Objeto com sucesso e possíveis erros
   */
  const login = async (credentials, type) => {
    // Lista de tipos de usuário válidos
    const validTypes = ['cliente', 'estabelecimento'];

    // Valida se o tipo informado é válido
    if (!validTypes.includes(type)) {
      return { success: false, error: 'Tipo de usuário inválido' };
    }

    // Limpa dados do tipo específico para evitar corrupção de estado
    clearAuthData(type);

    // ========================================
    // MODO DE DESENVOLVIMENTO (MOCK)
    // ========================================
    if (USE_MOCK_AUTH) {
      try {
        // Simula delay de rede (1 segundo)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Valida se email e senha foram fornecidos
        if (!credentials.email || !credentials.password) {
          return { success: false, error: 'Email e senha são obrigatórios' };
        }

        // Regex para validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          return { success: false, error: 'Email inválido' };
        }

        // Valida se a senha tem pelo menos 8 caracteres e complexidade
        if (credentials.password.length < 8) {
          return { success: false, error: 'A senha deve ter pelo menos 8 caracteres' };
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(credentials.password)) {
          return { success: false, error: 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número' };
        }

        // Gera token mock único usando timestamp e string aleatória
        const mockToken = `mock-jwt-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Cria objeto do usuário com dados fornecidos
        const mockUser = {
          id: Date.now(), // ID único baseado no timestamp
          email: credentials.email, // Email fornecido
          name: credentials.email.split('@')[0], // Nome extraído do email (parte antes do @)
          type, // Tipo de usuário
          token: mockToken, // Token gerado
        };

        // Armazena dados no localStorage para persistência
        // Armazena dados no localStorage usando chaves específicas do tipo
        const keys = getUserKeys(type);
        localStorage.setItem(keys.token, mockToken);
        localStorage.setItem(keys.userType, type);
        localStorage.setItem(keys.email, mockUser.email);
        localStorage.setItem(keys.name, mockUser.name);
        localStorage.setItem(keys.id, mockUser.id);

        // Atualiza os estados com dados do usuário logado
        setUser(mockUser);
        setUserType(type);

        // Dispara evento para sincronizar com outras abas
        window.dispatchEvent(new CustomEvent('authChange', { detail: { type, action: 'login' } }));

        // Retorna sucesso
        return { success: true };
      } catch (error) {
        // Se houver erro, loga e retorna mensagem genérica
        console.error('Erro no login:', error);
        return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
      }
    }

    // ========================================
    // MODO DE PRODUÇÃO (BACKEND REAL)
    // ========================================
    else {
      try {
        // Chama a API real do backend
        const endpoint = type === 'cliente' ? '/api/auth/login/user' : '/api/auth/login/establishment';
        const emailField = type === 'cliente' ? 'email_usuario' : 'email_empresa';
        const passwordField = type === 'cliente' ? 'senha_usuario' : 'senha_empresa';

        const response = await api.post(endpoint, {
          [emailField]: credentials.email,
          [passwordField]: credentials.password
        });

        if (response.data.success) {
          const { token, user } = response.data.data;

          console.log('📥 Dados recebidos do backend no login:', user);

          // Armazena dados no localStorage
        // Armazena dados no localStorage usando chaves específicas do tipo
        const keys = getUserKeys(user.userType);
        const userName = user.nome_usuario || user.nome_empresa;
        const userEmail = user.email_usuario || user.email_empresa;
        
        localStorage.setItem(keys.token, token);
        localStorage.setItem(keys.userType, user.userType);
        localStorage.setItem(keys.email, userEmail);
        localStorage.setItem(keys.name, userName);
        localStorage.setItem(keys.id, user.id);
        
        console.log('💾 Dados salvos no localStorage (login):', {
          name: userName,
          email: userEmail,
          type: user.userType,
          id: user.id
        });

          // Atualiza os estados
          setUser({
            id: user.id,
            email: user.email_usuario || user.email_empresa,
            name: user.nome_usuario || user.nome_empresa,
            type: user.userType,
            token
          });
          setUserType(user.userType);

          // Dispara evento para sincronizar com outras abas
          window.dispatchEvent(new CustomEvent('authChange', { detail: { type: user.userType, action: 'login' } }));

          return { success: true };
        } else {
          return { success: false, error: response.data.message };
        }
      } catch (error) {
        console.error('Erro no login:', error);
        return {
          success: false,
          error: error.response?.data?.message || 'Erro ao fazer login. Tente novamente.'
        };
      }
    }
  };

  /**
   * Função de logout
   * @returns {Promise<void>}
   */
  const logout = async () => {
    // ========================================
    // MODO DE DESENVOLVIMENTO (MOCK)
    // ========================================
    if (USE_MOCK_AUTH) {
      try {
        // Simula delay de rede (0.5 segundos)
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        // Se houver erro, loga mas continua com o logout
        console.error('Erro ao fazer logout:', error);
      } finally {
        // Sempre limpa os dados de autenticação
        clearAuthData();
        // Dispara evento para sincronizar com outras abas
        window.dispatchEvent(new CustomEvent('authChange', { detail: { action: 'logout' } }));
      }
    }

    // ========================================
    // MODO DE PRODUÇÃO (BACKEND REAL)
    // ========================================
    else {
      try {
        // Chama a API real do backend para logout
        await api.post('/api/auth/logout');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      } finally {
        // Sempre limpa os dados locais
        clearAuthData();
      }
    }
  };

  /**
   * Função de registro
   * @param {Object} userData - Objeto com dados do usuário
   * @param {string} type - Tipo de usuário ('cliente' ou 'estabelecimento')
   * @returns {Object} - Objeto com sucesso e possíveis erros
   */
  const register = async (userData, type) => {
    // Lista de tipos de usuário válidos
    const validTypes = ['cliente', 'estabelecimento'];

    // Valida se o tipo informado é válido
    if (!validTypes.includes(type)) {
      return { success: false, error: 'Tipo de usuário inválido' };
    }

    // ========================================
    // MODO DE DESENVOLVIMENTO (MOCK)
    // ========================================
    if (USE_MOCK_AUTH) {
      try {
        // Simula delay de rede (1.5 segundos)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Valida se email e senha foram fornecidos
        if (!userData.email || !userData.password) {
          return { success: false, error: 'Email e senha são obrigatórios' };
        }

        // Regex para validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          return { success: false, error: 'Email inválido' };
        }

        // Valida se a senha tem pelo menos 8 caracteres e complexidade
        if (userData.password.length < 8) {
          return { success: false, error: 'A senha deve ter pelo menos 8 caracteres' };
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
          return { success: false, error: 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número' };
        }

        // Gera token mock único usando timestamp e string aleatória
        const mockToken = `mock-jwt-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Cria objeto do usuário com dados fornecidos
        const mockUser = {
          id: Date.now(), // ID único baseado no timestamp
          email: userData.email, // Email fornecido
          name: userData.name || userData.email.split('@')[0], // Nome fornecido ou extraído do email
          type, // Tipo de usuário
          token: mockToken, // Token gerado
        };

        // Armazena dados no localStorage para persistência
        // Armazena dados no localStorage usando chaves específicas do tipo
        const keys = getUserKeys(type);
        localStorage.setItem(keys.token, mockToken);
        localStorage.setItem(keys.userType, type);
        localStorage.setItem(keys.email, mockUser.email);
        localStorage.setItem(keys.name, mockUser.name);
        localStorage.setItem(keys.id, mockUser.id);

        // Atualiza os estados com dados do usuário registrado
        setUser(mockUser);
        setUserType(type);

        // Retorna sucesso
        return { success: true };
      } catch (error) {
        // Se houver erro, loga e retorna mensagem genérica
        console.error('Erro no registro:', error);
        return { success: false, error: 'Erro ao fazer registro. Tente novamente.' };
      }
    }

    // ========================================
    // MODO DE PRODUÇÃO (BACKEND REAL)
    // ========================================
    else {
      try {
        // Chama a API real do backend para registro
        const endpoint = type === 'cliente' ? '/api/auth/register/user' : '/api/auth/register/establishment';
        
        const response = await api.post(endpoint, userData);

        if (response.data.success) {
          const { token, user } = response.data.data;

          console.log('📥 Dados recebidos do backend no registro:', user);

          // Armazena dados no localStorage
        // Armazena dados no localStorage usando chaves específicas do tipo
        const keys = getUserKeys(user.userType);
        const userName = user.nome_usuario || user.nome_empresa;
        const userEmail = user.email_usuario || user.email_empresa;
        
        localStorage.setItem(keys.token, token);
        localStorage.setItem(keys.userType, user.userType);
        localStorage.setItem(keys.email, userEmail);
        localStorage.setItem(keys.name, userName);
        localStorage.setItem(keys.id, user.id);
        
        console.log('💾 Dados salvos no localStorage (registro):', {
          name: userName,
          email: userEmail,
          type: user.userType,
          id: user.id
        });

          // Atualiza os estados
          setUser({
            id: user.id,
            email: user.email_usuario || user.email_empresa,
            name: user.nome_usuario || user.nome_empresa,
            type: user.userType,
            token
          });
          setUserType(user.userType);

          // Dispara evento para sincronizar com outras abas
          window.dispatchEvent(new CustomEvent('authChange', { detail: { type: user.userType, action: 'login' } }));

          return { success: true };
        } else {
          return { success: false, error: response.data.message };
        }
      } catch (error) {
        console.error('Erro no registro:', error);
        return {
          success: false,
          error: error.response?.data?.message || 'Erro ao fazer registro. Tente novamente.'
        };
      }
    }
  };


  /**
   * Objeto com todos os valores do contexto
   * Inclui estados, funções e valores computados
   */
  const value = {
    user, // Dados do usuário logado
    userType, // Tipo do usuário ('cliente' ou 'estabelecimento')
    loading, // Estado de carregamento
    login, // Função de login
    logout, // Função de logout
    register, // Função de registro
    isAuthenticated: !!user, // Boolean indicando se está autenticado (converte user para boolean)
  };



  // Retorna o Provider do contexto com todos os valores
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

