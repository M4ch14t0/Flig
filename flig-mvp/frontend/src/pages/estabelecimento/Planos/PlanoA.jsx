import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard } from 'lucide-react';
import './Plano.css';
import './PlanoA.css'; // Reutiliza o estilo da página de renovação

export default function PlanoA() {
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
        <main className="planoa-main">
          <button className="planoa-back" onClick={() => navigate(-1)}>
            Voltar
          </button>

          <div className="planoa-card">
            <div className="planoa-info">
              <h2>Plano: <span>Profissional</span></h2>
              <p><strong>Valor:</strong> R$ 198,90/mês</p>
              <p><strong>Tempo de Plano:</strong> 365 dias</p>
              <p><strong>Expira em:</strong> 19/06/2025</p>
              <p><strong>Tempo restante:</strong> 29 dias</p>
              <button className="planoa-btn">Assinar Plano</button>
            </div>

            <div className="planoa-beneficios">
              <h3>Inclui</h3>
              <ul>
                <li>✔ Tudo do plano Essencial</li>
                <li>✔ Estatísticas detalhadas</li>
                <li>✔ Relatórios automáticos mensais</li>
                <li>✔ Visualização de pulos pagos e ganhos gerados</li>
                <li>✔ Suporte prioritário</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
