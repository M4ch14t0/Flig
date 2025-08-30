import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Contexto de autenticação
 * Cria um contexto React para compartilhar dados de autenticação entre componentes
 * Permite que qualquer componente filho acesse dados do usuário logado
 */
export const AuthContext = createContext();

/**
 * Provider do contexto de autenticação
 * Componente que envolve a aplicação e fornece dados de autenticação
 * Gerencia o estado global de autenticação (usuário, tipo, loading)
 */
export const AuthProvider = ({ children }) => {
  // Estado para armazenar dados do usuário logado (null = não logado)
  const [user, setUser] = useState(null);

  // Estado para armazenar o tipo de usuário ('user' ou 'establishment')
  const [userType, setUserType] = useState(null);

  // Estado para controlar se está carregando dados de autenticação
  const [loading, setLoading] = useState(true);

  /**
   * Função para validar formato do token
   * Verifica se o token existe, é uma string e começa com 'mock-jwt-token-'
   * @param {string} token - Token a ser validado
   * @returns {boolean} - True se o token for válido, false caso contrário
   */
  const isValidTokenFormat = (token) => {
    return token && typeof token === 'string' && token.startsWith('mock-jwt-token-');
  };

  /**
   * Função para limpar dados de autenticação
   * Remove todos os dados do localStorage e reseta os estados
   * Usada no logout e quando há erros de autenticação
   */
  const clearAuthData = () => {
    try {
      // Remove todos os dados de autenticação do localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    } catch (error) {
      // Se houver erro ao acessar localStorage (ex: modo privado), loga o erro
      // eslint-disable-next-line no-console
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
  useEffect(() => {
    try {
      // Busca dados de autenticação armazenados no localStorage
      const token = localStorage.getItem('authToken');
      const storedUserType = localStorage.getItem('userType');
      const storedEmail = localStorage.getItem('userEmail');
      const storedName = localStorage.getItem('userName');

      // Verifica se existe token e tipo de usuário, e se o token é válido
      if (token && storedUserType && isValidTokenFormat(token)) {
        // Lista de tipos de usuário válidos
        const validTypes = ['user', 'establishment'];

        // Se o tipo armazenado não for válido, limpa os dados
        if (!validTypes.includes(storedUserType)) {
          clearAuthData();
        } else {
          // Define o tipo de usuário no estado
          setUserType(storedUserType);

          // Cria objeto do usuário com dados armazenados
          setUser({
            id: 1, // ID fixo para mock
            email: storedEmail || 'user@example.com', // Email armazenado ou padrão
            name: storedName || 'Usuário', // Nome armazenado ou padrão
            type: storedUserType, // Tipo do usuário
            token, // Token de autenticação
          });
        }
      }
    } catch (error) {
      // Se houver erro ao acessar localStorage, loga o erro
      // eslint-disable-next-line no-console
      console.error('Erro ao acessar localStorage:', error);
    } finally {
      // Sempre define loading como false, independente do resultado
      setLoading(false);
    }
  }, []); // Array vazio = executa apenas uma vez ao montar

  /**
   * Função de login mock
   * Simula processo de autenticação com validações e delay
   * @param {Object} credentials - Objeto com email e senha
   * @param {string} type - Tipo de usuário ('user' ou 'establishment')
   * @returns {Object} - Objeto com sucesso e possíveis erros
   */
  const login = async (credentials, type) => {
    // Lista de tipos de usuário válidos
    const validTypes = ['user', 'establishment'];

    // Valida se o tipo informado é válido
    if (!validTypes.includes(type)) {
      return { success: false, error: 'Tipo de usuário inválido' };
    }

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

      // Valida se a senha tem pelo menos 6 caracteres
      if (credentials.password.length < 6) {
        return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
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
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userType', type);
      localStorage.setItem('userEmail', mockUser.email);
      localStorage.setItem('userName', mockUser.name);

      // Atualiza os estados com dados do usuário logado
      setUser(mockUser);
      setUserType(type);

      // Retorna sucesso
      return { success: true };
    } catch (error) {
      // Se houver erro, loga e retorna mensagem genérica
      // eslint-disable-next-line no-console
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
    }
  };

  /**
   * Função de logout
   * Simula processo de logout com delay e limpa dados de autenticação
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      // Simula delay de rede (0.5 segundos)
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      // Se houver erro, loga mas continua com o logout
      // eslint-disable-next-line no-console
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Sempre limpa os dados de autenticação
      clearAuthData();
    }
  };

  /**
   * Função de registro mock
   * Simula processo de cadastro com validações e delay
   * @param {Object} userData - Objeto com dados do usuário
   * @param {string} type - Tipo de usuário ('user' ou 'establishment')
   * @returns {Object} - Objeto com sucesso e possíveis erros
   */
  const register = async (userData, type) => {
    // Lista de tipos de usuário válidos
    const validTypes = ['user', 'establishment'];

    // Valida se o tipo informado é válido
    if (!validTypes.includes(type)) {
      return { success: false, error: 'Tipo de usuário inválido' };
    }

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

      // Valida se a senha tem pelo menos 6 caracteres
      if (userData.password.length < 6) {
        return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
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
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userType', type);
      localStorage.setItem('userEmail', mockUser.email);
      localStorage.setItem('userName', mockUser.name);

      // Atualiza os estados com dados do usuário registrado
      setUser(mockUser);
      setUserType(type);

      // Retorna sucesso
      return { success: true };
    } catch (error) {
      // Se houver erro, loga e retorna mensagem genérica
      // eslint-disable-next-line no-console
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro ao fazer registro. Tente novamente.' };
    }
  };

  /**
   * Objeto com todos os valores do contexto
   * Inclui estados, funções e valores computados
   */
  const value = {
    user, // Dados do usuário logado
    userType, // Tipo do usuário ('user' ou 'establishment')
    loading, // Estado de carregamento
    login, // Função de login
    logout, // Função de logout
    register, // Função de registro
    isAuthenticated: !!user, // Boolean indicando se está autenticado (converte user para boolean)
  };

  // Retorna o Provider do contexto com todos os valores
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook customizado para usar o contexto de autenticação
 * Permite que componentes acessem dados de autenticação facilmente
 * @returns {Object} - Objeto com todos os valores do contexto
 * @throws {Error} - Se usado fora do AuthProvider
 */
export const useAuth = () => {
  // Busca o contexto de autenticação
  const context = useContext(AuthContext);

  // Se o contexto não existir, significa que o componente não está dentro do AuthProvider
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  // Retorna o contexto
  return context;
};
