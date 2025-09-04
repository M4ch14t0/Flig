import { createContext, useContext } from 'react';

/**
 * Contexto de autenticação
 * Cria um contexto React para compartilhar dados de autenticação entre componentes
 * Permite que qualquer componente filho acesse dados do usuário logado
 */
export const AuthContext = createContext();

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
