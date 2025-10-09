import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './styles/index.css';

/**
 * PONTO DE ENTRADA PRINCIPAL DA APLICAÇÃO
 *
 * Este arquivo é responsável por:
 * - Inicializar a aplicação React
 * - Configurar o roteamento
 * - Fornecer o contexto de autenticação
 * - Renderizar o componente raiz
 *
 * Estrutura de Providers (de fora para dentro):
 * 1. React.StrictMode - Modo estrito para desenvolvimento
 * 2. BrowserRouter - Roteamento baseado em histórico do navegador
 * 3. AuthProvider - Contexto de autenticação global
 * 4. AppRoutes - Sistema de rotas da aplicação
 */

// Cria a raiz da aplicação React no elemento DOM com id 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  // Modo estrito do React - ajuda a identificar problemas em desenvolvimento
  <React.StrictMode>
    {/*
      BrowserRouter - Fornece roteamento baseado em histórico do navegador
      Permite navegação entre páginas sem recarregar a aplicação
      Suporta URLs limpas e navegação com botões voltar/avançar
    */}
    <BrowserRouter>
      {/*
        AuthProvider - Contexto de autenticação global
        Fornece dados de usuário, funções de login/logout para toda a aplicação
        Gerencia estado de autenticação e persistência no localStorage
      */}
      <AuthProvider>
        {/*
          ThemeProvider - Contexto de tema global
          Fornece funcionalidade de alternância entre tema claro e escuro
          Gerencia persistência do tema no localStorage
        */}
        <ThemeProvider>
          {/*
            AppRoutes - Sistema de roteamento principal
            Define todas as rotas disponíveis e suas proteções
            Organiza rotas por tipo de acesso (público, cliente, estabelecimento)
          */}
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
