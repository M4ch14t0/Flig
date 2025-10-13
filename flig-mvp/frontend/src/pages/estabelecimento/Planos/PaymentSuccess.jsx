import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Home, BarChart2, List, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import Layout from '../../../components/Layout';
import { api } from '../../../services/api';
import './PaymentSuccess.module.css';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} /> },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} />, active: true },
  ];

  useEffect(() => {
    // Simular verificação do status do pagamento
    const checkPaymentStatus = async () => {
      try {
        // Aqui você pode verificar o status real do pagamento
        // const paymentId = searchParams.get('payment_id');
        // const response = await api.get(`/api/plans/payment/status/${paymentId}`);
        
        // Por enquanto, simular sucesso
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (err) {
        console.error('Erro ao verificar status do pagamento:', err);
        setError('Erro ao verificar status do pagamento');
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <Layout sidebarLinks={sidebarLinks} userType="estabelecimento">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Verificando pagamento...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout sidebarLinks={sidebarLinks} userType="estabelecimento">
        <div className="error-container">
          <h2>Erro</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/estabelecimento/planos')} className="btn-secondary">
            Voltar aos Planos
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento">
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          
          <h1>Pagamento Aprovado!</h1>
          <p className="success-message">
            Seu plano foi ativado com sucesso. Agora você pode usar todas as funcionalidades do sistema.
          </p>

          <div className="success-actions">
            <button 
              onClick={() => navigate('/estabelecimento/dashboard')}
              className="btn-primary"
            >
              <ArrowRight size={16} />
              Ir para Dashboard
            </button>
            
            <button 
              onClick={() => navigate('/estabelecimento/gerenciar-filas')}
              className="btn-secondary"
            >
              Gerenciar Filas
            </button>
          </div>

          <div className="success-info">
            <h3>O que você pode fazer agora:</h3>
            <ul>
              <li>Criar e gerenciar filas</li>
              <li>Chamar clientes automaticamente</li>
              <li>Visualizar relatórios detalhados</li>
              <li>Acessar todas as funcionalidades premium</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
