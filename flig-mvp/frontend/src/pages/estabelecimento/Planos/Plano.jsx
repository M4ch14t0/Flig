import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard } from 'lucide-react';
import { api } from '../../../services/api';
import './Plano.css';

export default function Plano() {
  const navigate = useNavigate();
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [loading, setLoading] = useState(true);

  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} /> },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} />, active: true },
  ];

  useEffect(() => {
    checkPlanStatus();
  }, []);

  const checkPlanStatus = async () => {
    try {
      const response = await api.get('/api/plans/status');
      if (response.data.success && response.data.data.hasActivePlan) {
        setHasActivePlan(true);
      }
    } catch (error) {
      console.error('Erro ao verificar status do plano:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <div className="plano-container">
        <main className="plano-main">
          <h1 className="plano-title">Planos</h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Carregando...</p>
            </div>
          ) : (
            <div className="plano-cards-container">
              <div className="plano-card">
                <h2>Essencial</h2>
                <div className="plano-preco-container">
                  <span className="plano-preco">R$: 89,90</span>
                  <span className="plano-periodo">/mês</span>
                </div>
                {hasActivePlan ? (
                  <button onClick={() => navigate('/estabelecimento/planos/detalhes-essencial')} className="plano-btn renovar">
                    Renovar Contrato
                  </button>
                ) : (
                  <button onClick={() => navigate('/estabelecimento/planos/detalhes-essencial')} className="plano-btn assinar">
                    Assinar Plano
                  </button>
                )}
              </div>

              <div className="plano-card">
                <h2>Profissional</h2>
                <div className="plano-preco-container">
                  <span className="plano-preco">R$: 129,90</span>
                  <span className="plano-periodo">/mês</span>
                </div>
                {hasActivePlan ? (
                  <button onClick={() => navigate('/estabelecimento/planos/detalhes-profissional')} className="plano-btn renovar">
                    Renovar Contrato
                  </button>
                ) : (
                  <button onClick={() => navigate('/estabelecimento/planos/detalhes-profissional')} className="plano-btn assinar">
                    Assinar Plano
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="plano-contact">
            <a href="mailto:contato@flig.com.br" className="plano-contact-link">
              Contatar Flig
            </a>
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
