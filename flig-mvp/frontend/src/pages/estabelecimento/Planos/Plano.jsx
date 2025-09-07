import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard } from 'lucide-react';
import './Plano.css';

export default function Plano() {
  const navigate = useNavigate();

  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} /> },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} />, active: true },
  ];

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <div className="plano-container">
        <main className="plano-main">
          <h1>Planos</h1>

          <div className="plano-card">
            <h2>Essencial</h2>
            <p className="plano-preco">R$ 89,90/mês</p>
            <button onClick={() => navigate('/estabelecimento/planos/renovar')} className="plano-btn renovar">
              Renovar Contrato
            </button>
          </div>

          <div className="plano-card">
            <h2>Profissional</h2>
            <p className="plano-preco">R$ 189,90/mês</p>
            <button onClick={() => navigate('/estabelecimento/planos/assinar')} className="plano-btn assinar">
              Assinar Plano
            </button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
