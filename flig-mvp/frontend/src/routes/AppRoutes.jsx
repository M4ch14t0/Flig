import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * PÁGINAS INSTITUCIONAIS
 * Páginas públicas que não requerem autenticação
 * Acessíveis a todos os usuários
 */
import Webpage from '../pages/Webpage'; // Página inicial institucional da empresa
import FAQ from '../pages/FAQ'; // Página de perguntas frequentes
import NotFound from '../pages/NotFound'; // Página 404 - rota não encontrada
import TesteFila from '../pages/TesteFila'; // Página de teste do sistema

/**
 * PÁGINAS DE AUTENTICAÇÃO
 * Páginas para login, cadastro e seleção de perfil
 * Não requerem autenticação prévia
 */
import SelectProfile from '../pages/auth/SelectProfile/SelectProfile'; // Escolha entre cliente ou estabelecimento
import LoginE from '../pages/auth/LoginE/LoginE'; // Login para estabelecimentos
import LoginU from '../pages/auth/LoginU/LoginU'; // Login para clientes
import CadastroU from '../pages/auth/CadastroU/CadastroU'; // Cadastro de clientes
import CadastroE from '../pages/auth/CadastroE/CadastroE'; // Cadastro de estabelecimentos

/**
 * PÁGINAS DO CLIENTE
 * Páginas acessíveis apenas para usuários logados como cliente
 * Requerem autenticação e tipo de usuário 'cliente'
 */
import UserHome from '../pages/cliente/UserHome/UserHome'; // Página inicial do cliente
import Estabelecimentos from '../pages/cliente/Estabelecimentos/Estabelecimentos'; // Lista de estabelecimentos disponíveis
import DetEstabelecimentos from '../pages/cliente/DetEstab/DetEstabelecimentos'; // Detalhes de um estabelecimento específico
import MinhasFilas from '../pages/cliente/MinhasFilas/MinhasFilas'; // Filas que o cliente está participando
import Pagamento from '../pages/cliente/Pagamento/Pagamento'; // Página de pagamento para clientes
import ContaU from '../pages/cliente/ContaU/ContaU'; // Perfil e dados pessoais do cliente
import ConfigU from '../pages/cliente/ConfigU/ConfigU'; // Configurações da conta do cliente

/**
 * PÁGINAS DO ESTABELECIMENTO
 * Páginas acessíveis apenas para usuários logados como estabelecimento
 * Requerem autenticação e tipo de usuário 'estabelecimento'
 */
import EstHome from '../pages/estabelecimento/EstHome/EstHome'; // Página inicial do estabelecimento
import Dashboard from '../pages/estabelecimento/Dashboard'; // Dashboard com estatísticas e métricas
import GerenciarFilas from '../pages/estabelecimento/GerFilas/GerenciarFilas'; // Gerenciamento geral das filas
import DetalhesFila from '../pages/estabelecimento/GerFilas/DetalhesFila'; // Detalhes de uma fila específica
import PagamentoEstab from '../pages/estabelecimento/PagamentoE/PagamentoE'; // Página de pagamento para estabelecimentos
import ContaE from '../pages/estabelecimento/ContaE/ContaE'; // Perfil e dados da empresa
import ConfigE from '../pages/estabelecimento/ConfigE/ConfigE'; // Configurações da conta do estabelecimento
import Plano from '../pages/estabelecimento/Planos/Plano'; // Página principal de planos
import PlanoA from '../pages/estabelecimento/Planos/PlanoA'; // Página para assinar novos planos
import PlanoR from '../pages/estabelecimento/Planos/PlanoR'; // Página para renovar planos existentes
import PlanoGratuito from '../pages/estabelecimento/Planos/PlanoGratuito'; // Detalhes do plano gratuito
import PlanoPremium from '../pages/estabelecimento/Planos/PlanoPremium'; // Detalhes do plano premium

/**
 * Componente principal de roteamento da aplicação
 * Define todas as rotas disponíveis e suas proteções
 * Organiza rotas por tipo de acesso (público, cliente, estabelecimento)
 */
function AppRoutes() {
  return (
    <Routes>
      {/*
        ROTAS PÚBLICAS
        Acessíveis a todos os usuários, sem autenticação
      */}
      <Route path="/" element={<Webpage />} /> {/* Página inicial da empresa */}
      <Route path="/faq" element={<FAQ />} /> {/* Perguntas frequentes */}

      {/*
        ROTAS DE AUTENTICAÇÃO
        Para login, cadastro e seleção de perfil
        Não requerem autenticação prévia
      */}
      <Route path="/escolha-login" element={<SelectProfile />} /> {/* Escolha entre cliente/estabelecimento */}
      <Route path="/login" element={<LoginU />} /> {/* Login para clientes */}
      <Route path="/login-estab" element={<LoginE />} /> {/* Login para estabelecimentos */}
      <Route path="/cadastro-cliente" element={<CadastroU />} /> {/* Cadastro de clientes */}
      <Route path="/cadastro-estabelecimento" element={<CadastroE />} /> {/* Cadastro de estabelecimentos */}

      {/*
        ROTAS PROTEGIDAS - CLIENTE
        Acessíveis apenas para usuários logados como cliente
        Usam o componente ProtectedRoute para verificar autenticação e tipo
      */}
      {/* Rotas protegidas do cliente */}
      <Route path="/cliente/home" element={
        <ProtectedRoute requiredUserType="cliente">
          <UserHome />
        </ProtectedRoute>
      } />
      <Route path="/cliente/estabelecimentos" element={
        <ProtectedRoute requiredUserType="cliente">
          <Estabelecimentos />
        </ProtectedRoute>
      } />
      <Route path="/cliente/estabelecimentos/:id" element={
        <ProtectedRoute requiredUserType="cliente">
          <DetEstabelecimentos />
        </ProtectedRoute>
      } />
      <Route path="/cliente/minhas-filas" element={
        <ProtectedRoute requiredUserType="cliente">
          <MinhasFilas />
        </ProtectedRoute>
      } />
      <Route path="/cliente/pagamento" element={
        <ProtectedRoute requiredUserType="cliente">
          <Pagamento />
        </ProtectedRoute>
      } />
      <Route path="/cliente/perfil" element={
        <ProtectedRoute requiredUserType="cliente">
          <ContaU />
        </ProtectedRoute>
      } />
      <Route path="/cliente/configuracoes" element={
        <ProtectedRoute requiredUserType="cliente">
          <ConfigU />
        </ProtectedRoute>
      } />

      {/*
        ROTAS PROTEGIDAS - ESTABELECIMENTO
        Acessíveis apenas para usuários logados como estabelecimento
        Usam o componente ProtectedRoute para verificar autenticação e tipo
      */}
      <Route path="/estabelecimento/*" element={
        <ProtectedRoute requiredUserType="estabelecimento">
          <Routes>
            <Route path="home" element={<EstHome />} /> {/* Página inicial do estabelecimento */}
            <Route path="dashboard" element={<Dashboard />} /> {/* Dashboard com estatísticas */}
            <Route path="gerenciar-filas" element={<GerenciarFilas />} /> {/* Gerenciamento de filas */}
            <Route path="gerenciar-filas/:id" element={<DetalhesFila />} /> {/* Detalhes de fila específica */}
            <Route path="pagamento" element={<PagamentoEstab />} /> {/* Página de pagamento */}
            <Route path="perfil" element={<ContaE />} /> {/* Perfil da empresa */}
            <Route path="configuracoes" element={<ConfigE />} /> {/* Configurações da conta */}
            <Route path="planos" element={<Plano />} /> {/* Página principal de planos */}
            <Route path="planos/assinar" element={<PlanoA />} /> {/* Assinar novos planos */}
            <Route path="planos/renovar" element={<PlanoR />} /> {/* Renovar planos existentes */}
            <Route path="planos/gratuito" element={<PlanoGratuito />} /> {/* Plano gratuito */}
            <Route path="planos/premium" element={<PlanoPremium />} /> {/* Plano premium */}
            <Route path="*" element={<Navigate to="/estabelecimento/home" replace />} /> {/* Redireciona rotas inválidas para home */}
          </Routes>
        </ProtectedRoute>
      } />

      {/*
        ROTA DE TESTE
        Página para testar funcionalidades do sistema
      */}
      <Route path="/teste" element={<TesteFila />} />

      {/*
        ROTA 404 - PÁGINA NÃO ENCONTRADA
        Captura todas as rotas que não correspondem às definidas acima
        Deve ser sempre a última rota
      */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
