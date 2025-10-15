import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard, ArrowLeft } from 'lucide-react';
import { api } from '../../../services/api';
import './DetalhesPlano.css';

export default function DetalhesPlanoEssencial() {
  const navigate = useNavigate();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} /> },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} />, active: true },
  ];

  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      const response = await api.get('/api/plans/status');
      if (response.data.success) {
        setPlanData(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do plano:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const calculateDaysRemaining = (expirationDate) => {
    if (!expirationDate) return 0;
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <div className="plano-container">
        <main className="detalhes-main">
          <button className="detalhes-back" onClick={() => navigate('/estabelecimento/planos')}>
            <ArrowLeft size={16} />
            Voltar
          </button>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Carregando dados do plano...</p>
            </div>
          ) : (
            <div className="detalhes-card">
              <div className="detalhes-info">
                <h2>Plano: <span>Essencial</span></h2>
                <p><strong>Valor:</strong> R$ 89,90/mês</p>
                <p><strong>Tempo de Plano:</strong> 30 dias</p>
                {planData?.hasActivePlan && planData?.subscription?.plano_id === 1 ? (
                  <>
                    <p><strong>Expira em:</strong> {formatDate(planData.subscription.data_vencimento)}</p>
                    <p><strong>Tempo restante:</strong> {calculateDaysRemaining(planData.subscription.data_vencimento)} dias</p>
                    <button className="detalhes-btn">Renovar Contrato</button>
                  </>
                ) : (
                  <>
                    <p><strong>Expira em:</strong> N/A</p>
                    <p><strong>Tempo restante:</strong> N/A</p>
                    <button className="detalhes-btn">Assinar Plano</button>
                  </>
                )}
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
          )}
        </main>

        <footer className="plano-footer">
          <div className="plano-footer-line"></div>
          <p>Copyright© 2025 Flig Soluções de agilidade. Todos os Direitos Reservados</p>
        </footer>
      </div>
    </Layout>
  );
}
