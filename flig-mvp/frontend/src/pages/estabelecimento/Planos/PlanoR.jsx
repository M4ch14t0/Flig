import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard } from 'lucide-react';
import './Plano.css';
import './PlanoR.css';

export default function PlanoR() {
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
        <main className="planor-main">
          <button className="planor-back" onClick={() => navigate(-1)}>
            Voltar
          </button>

          <div className="planor-card">
            <div className="planor-info">
              <h2>Plano: <span>Essencial</span></h2>
              <p><strong>Valor:</strong> R$ 89,90/mês</p>
              <p><strong>Assinado em:</strong> 19/06/2024</p>
              <p><strong>Expira em:</strong> 19/06/2025</p>
              <p><strong>Tempo restante:</strong> 29 dias</p>
              <button className="planor-btn">Renovar Contrato</button>
            </div>

            <div className="planor-beneficios">
              <h3>Benefícios do Plano</h3>
              <ul>
                <li>✔ Filas ilimitadas</li>
                <li>✔ Notificações automáticas para clientes</li>
                <li>✔ Painel básico com visão geral das filas</li>
                <li>✔ Suporte por e-mail</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
