import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente ProtectedRoute - Rota Protegida
 * 
 * Funcionalidade:
 * - Protege rotas que requerem autenticação
 * - Verifica se o usuário está logado
 * - Verifica se o usuário tem o tipo correto (cliente ou estabelecimento)
 * - Redireciona usuários não autorizados para páginas apropriadas
 * 
 * @param {React.ReactNode} children - Componentes filhos a serem renderizados se autorizado
 * @param {string|null} requiredUserType - Tipo de usuário requerido ('cliente', 'estabelecimento' ou null para qualquer tipo)
 * @param {string} redirectTo - Rota para redirecionar usuários não autenticados
 * @returns {React.ReactNode} - Componente protegido ou redirecionamento
 */
export default function ProtectedRoute({
  children,
  requiredUserType = null, // null = qualquer tipo de usuário autenticado
  redirectTo = '/escolha-login' // Rota padrão para redirecionamento
}) {
  // Hook personalizado para acessar dados de autenticação
  const { isAuthenticated, userType, loading } = useAuth();
  
  // Hook do React Router para obter informações da rota atual
  const location = useLocation();

  /**
   * ESTADO DE CARREGAMENTO
   * Mostra tela de loading enquanto verifica autenticação
   * Evita flash de conteúdo ou redirecionamentos incorretos
   */
  if (loading) {
    return (
      <div style={{
        display: 'flex', // Layout flexbox para centralização
        justifyContent: 'center', // Centraliza horizontalmente
        alignItems: 'center', // Centraliza verticalmente
        height: '100vh', // Altura total da viewport
        fontSize: '18px' // Tamanho da fonte para o texto de loading
      }}>
        Carregando... {/* Texto exibido durante o carregamento */}
      </div>
    );
  }

  /**
   * VERIFICAÇÃO DE AUTENTICAÇÃO
   * Se o usuário não está autenticado, redireciona para a página de login
   * Preserva a rota original para redirecionamento após login
   */
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
    // to: rota de destino (página de login)
    // state: salva a rota atual para redirecionamento posterior
    // replace: substitui a entrada no histórico (evita voltar para rota protegida)
  }

  /**
   * VERIFICAÇÃO DE TIPO DE USUÁRIO
   * Se a rota requer um tipo específico, verifica se o usuário tem permissão
   * Redireciona para a home apropriada se o tipo não corresponder
   */
  if (requiredUserType && userType !== requiredUserType) {
    // Define a rota de redirecionamento baseada no tipo atual do usuário
    const redirectPath = userType === 'cliente' ? '/cliente/home' : '/estabelecimento/home';
    
    // Redireciona para a home apropriada do tipo de usuário
    return <Navigate to={redirectPath} replace />;
    // replace: substitui a entrada no histórico (evita navegação incorreta)
  }

  /**
   * ACESSO AUTORIZADO
   * Se todas as verificações passaram, renderiza os componentes filhos
   * O usuário tem acesso à rota protegida
   */
  return children;
}
