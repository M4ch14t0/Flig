import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Páginas Institucionais
import Webpage from '../pages/Webpage';
import FAQ from '../pages/FAQ';
import NotFound from '../pages/NotFound';

// Páginas de Autenticação
import SelectProfile from '../pages/auth/SelectProfile/SelectProfile';
import LoginE from '../pages/auth/LoginE/LoginE';
import LoginU from '../pages/auth/LoginU/LoginU';
import CadastroU from '../pages/auth/CadastroU/CadastroU';
import CadastroE from '../pages/auth/CadastroE/CadastroE';

// Páginas do Cliente
import UserHome from '../pages/cliente/UserHome/UserHome';
import Estabelecimentos from '../pages/cliente/Estabelecimentos/Estabelecimentos';
import DetEstabelecimentos from '../pages/cliente/DetEstab/DetEstabelecimentos';
import MinhasFilas from '../pages/cliente/MinhasFilas/MinhasFilas';
import Pagamento from '../pages/cliente/Pagamento/Pagamento';
import ContaU from '../pages/cliente/ContaU/ContaU';
import ConfigU from '../pages/cliente/ConfigU/ConfigU';

// Páginas do Estabelecimento
import EstHome from '../pages/estabelecimento/EstHome/EstHome';
import Dashboard from '../pages/estabelecimento/Dashboard';
import GerenciarFilas from '../pages/estabelecimento/GerFilas/GerenciarFilas';
import DetalhesFila from '../pages/estabelecimento/GerFilas/DetalhesFila';
import PagamentoEstab from '../pages/estabelecimento/PagamentoE/PagamentoE';
import ContaE from '../pages/estabelecimento/ContaE/ContaE';
import ConfigE from '../pages/estabelecimento/ConfigE/ConfigE';
import Plano from '../pages/estabelecimento/Planos/Plano';
import PlanoA from '../pages/estabelecimento/Planos/PlanoA';
import PlanoR from '../pages/estabelecimento/Planos/PlanoR';
import PlanoGratuito from '../pages/estabelecimento/Planos/PlanoGratuito';
import PlanoPremium from '../pages/estabelecimento/Planos/PlanoPremium';

function AppRoutes() {
  return (
    <Routes>
      {/* Institucional */}
      <Route path="/" element={<Webpage />} />
      <Route path="/faq" element={<FAQ />} />

      {/* Autenticação */}
      <Route path="/escolha-login" element={<SelectProfile />} />
      <Route path="/login" element={<LoginU />} />
      <Route path="/login-estab" element={<LoginE />} />
      <Route path="/cadastro-cliente" element={<CadastroU />} />
      <Route path="/cadastro-estabelecimento" element={<CadastroE />} />

      {/* Cliente */}
      <Route path="/cliente/home" element={<UserHome />} />
      <Route path="/cliente/estabelecimentos" element={<Estabelecimentos />} />
      <Route path="/cliente/estabelecimentos/:id" element={<DetEstabelecimentos />} />
      <Route path="/cliente/minhas-filas" element={<MinhasFilas />} />
      <Route path="/cliente/pagamento" element={<Pagamento />} />
      <Route path="/cliente/perfil" element={<ContaU />} />
      <Route path="/cliente/configuracoes" element={<ConfigU />} />

      {/* Estabelecimento */}
      <Route path="/estabelecimento/home" element={<EstHome />} />
      <Route path="/estabelecimento/dashboard" element={<Dashboard />} />
      <Route path="/estabelecimento/gerenciar-filas" element={<GerenciarFilas />} />
      <Route path="/estabelecimento/gerenciar-filas/:id" element={<DetalhesFila />} />
      <Route path="/estabelecimento/pagamento" element={<PagamentoEstab />} />
      <Route path="/estabelecimento/perfil" element={<ContaE />} />
      <Route path="/estabelecimento/configuracoes" element={<ConfigE />} />
      <Route path="/estabelecimento/planos" element={<Plano />} />
      <Route path="/estabelecimento/planos/assinar" element={<PlanoA />} />
      <Route path="/estabelecimento/planos/renovar" element={<PlanoR />} />
      <Route path="/estabelecimento/planos/gratuito" element={<PlanoGratuito />} />
      <Route path="/estabelecimento/planos/premium" element={<PlanoPremium />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
