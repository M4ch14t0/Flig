import React from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom';

// Páginas Institucionais
import Webpage from '../pages/Webpage';
//import NotFound from '../pages/NotFound';

// Páginas de Autenticação
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
//import Dashboard from '../pages/estabelecimento/Dashboard';
import GerenciarFilas from '../pages/estabelecimento/GerFilas/GerenciarFilas';
//import DetalhesFila from '../pages/estabelecimento/DetalhesFila';
import PagamentoEstab from '../pages/estabelecimento/PagamentoE/PagamentoE';
import ContaE from '../pages/estabelecimento/ContaE/ContaE';
import ConfigE from '../pages/estabelecimento/ConfigE/ConfigE';

function AppRoutes() {
  return (
    
      <Routes>
        {/* Institucional */}
        <Route path="/" element={<Webpage />} />
        {/*<Route path="*" element={<NotFound />} />*/}

        {/* Autenticação */}
        <Route path="/login-cliente" element={<LoginU />} />
        <Route path="/login-estabelecimento" element={<LoginE />} />
        <Route path="/cadastro-cliente" element={<CadastroU />} />
        <Route path="/cadastro-estabelecimento" element={<CadastroE />} />

        {/* Cliente */}
        <Route path="/cliente/home" element={<UserHome />} />
        <Route path="/cliente/estabelecimentos" element={<Estabelecimentos />} />
        <Route path="/cliente/estabelecimentos/:id" element={<DetEstabelecimentos />} />
        <Route path="/cliente/minhas-filas" element={<MinhasFilas />} />
        <Route path="/cliente/pagamento" element={<Pagamento />} />
        <Route path="/cliente/conta" element={<ContaU />} />
        <Route path="/cliente/configu" element={<ConfigU />} />

        {/* Estabelecimento */}
        <Route path="/estabelecimento/home" element={<EstHome />} />
        {/*<Route path="/estabelecimento/dashboard" element={<Dashboard />} /> */}
        <Route path="/estabelecimento/gerenciar-filas" element={<GerenciarFilas />} />
        {/*<Route path="/estabelecimento/gerenciar-filas/:id" element={<DetalhesFila />} /> */}
        <Route path="/estabelecimento/pagamento" element={<PagamentoEstab />} />
        <Route path="/estabelecimento/conta" element={<ContaE />} />
        <Route path="/estabelecimento/configu" element={<ConfigE />} />
      </Routes>
    
  );
}

export default AppRoutes;
