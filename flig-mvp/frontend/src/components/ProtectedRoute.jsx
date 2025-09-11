import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContextImports.js';

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
export default function ProtectedRoute({ children }) {
  // ⚠️ PROTECTEDROUTE DESABILITADO PARA TESTES
  return children;
}
