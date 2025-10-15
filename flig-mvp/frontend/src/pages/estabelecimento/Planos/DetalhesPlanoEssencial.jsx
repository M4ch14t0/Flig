import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard, ArrowLeft } from 'lucide-react';
import './DetalhesPlano.css';

export default function DetalhesPlanoEssencial() {
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
        <main className="detalhes-main">
          <button className="detalhes-back" onClick={() => navigate('/estabelecimento/planos')}>
            <ArrowLeft size={16} />
            Voltar
          </button>

          <div className="detalhes-card">
            <div className="detalhes-info">
              <h2>Plano: <span>Essencial</span></h2>
              <p><strong>Valor:</strong> R$ 89,90/mês</p>
              <p><strong>Tempo de Plano:</strong> 30 dias</p>
              <p><strong>Expira em:</strong> 19/06/2025</p>
              <p><strong>Tempo restante:</strong> 15 dias</p>
              <button className="detalhes-btn">Assinar Plano</button>
            </div>

            <div className="detalhes-beneficios">
              <h3>Inclui:</h3>
              <ul>
                <li> Até 3 filas simultâneas</li>
                <li> Dashboard básico</li>
                <li> Relatórios simples</li>
                <li> Suporte por email</li>
                <li> Notificações básicas</li>
              </ul>
            </div>
          </div>
        </main>

        <footer className="plano-footer">
          <div className="plano-footer-line"></div>
          <p>Copyright© 2025 Flig Soluções de agilidade. Todos os Direitos Reservados</p>
        </footer>
      </div>
    </Layout>
  );
}
