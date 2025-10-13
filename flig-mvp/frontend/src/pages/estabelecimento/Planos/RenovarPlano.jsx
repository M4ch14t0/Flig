import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, List, CreditCard, ArrowLeft } from 'lucide-react';
import Layout from '../../../components/Layout';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/authContextImports.js';
import './RenovarPlano.module.css';

export default function RenovarPlano() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plano, setPlano] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} /> },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} />, active: true },
  ];

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/api/plans/status');
      if (response.data.success && response.data.data.hasActivePlan) {
        setSubscription(response.data.data.subscription);
        setPlano(response.data.data.plan);
      } else {
        // Redirecionar para página de planos se não tiver plano ativo
        navigate('/estabelecimento/planos');
        return;
      }
    } catch (err) {
      console.error('Erro ao buscar assinatura:', err);
      // Redirecionar para página de planos em caso de erro
      navigate('/estabelecimento/planos');
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleRenovarPlano = async () => {
    try {
      setPaymentLoading(true);
      
      // Criar nova assinatura (renovação)
      const subscriptionResponse = await api.post('/api/plans/subscriptions', {
        plano_id: plano.id
      });

      if (!subscriptionResponse.data.success) {
        throw new Error(subscriptionResponse.data.message);
      }

      const subscriptionId = subscriptionResponse.data.data.subscription_id;

      // Criar preferência de pagamento
      const paymentResponse = await api.post('/api/plans/payment/preference', {
        subscription_id: subscriptionId,
        plano_id: plano.id
      });

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message);
      }

      // Redirecionar para o Mercado Pago
      const { init_point } = paymentResponse.data.data;
      window.location.href = init_point;

    } catch (err) {
      console.error('Erro ao processar renovação:', err);
      setError(err.message || 'Erro ao processar renovação');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout sidebarLinks={sidebarLinks} userType="estabelecimento">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Carregando assinatura...</p>
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
            <ArrowLeft size={16} />
            Voltar aos Planos
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento">
      <div className="renovar-container">
        <div className="renovar-header">
          <button 
            onClick={() => navigate('/estabelecimento/planos')} 
            className="btn-back"
          >
            <ArrowLeft size={16} />
            Voltar aos Planos
          </button>
          <h1>Renovar Plano</h1>
        </div>

        <div className="subscription-info">
          <div className="info-card">
            <h2>Assinatura Atual</h2>
            <div className="info-item">
              <span className="label">Plano:</span>
              <span className="value">{plano.nome}</span>
            </div>
            <div className="info-item">
              <span className="label">Valor:</span>
              <span className="value">R$ {subscription.valor}/mês</span>
            </div>
            <div className="info-item">
              <span className="label">Vencimento:</span>
              <span className="value">{new Date(subscription.data_vencimento).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`status ${subscription.status}`}>
                {subscription.status === 'active' ? 'Ativo' : subscription.status}
              </span>
            </div>
          </div>
        </div>

        <div className="plano-details">
          <div className="plano-card">
            <h2>Renovar {plano.nome}</h2>
            <p className="plano-descricao">{plano.descricao}</p>
            
            <div className="plano-preco">
              <span className="valor">R$ {plano.preco}</span>
              <span className="periodo">/mês</span>
            </div>

            <div className="plano-recursos">
              <h3>Recursos incluídos:</h3>
              <ul>
                {plano.max_filas ? (
                  <li>Até {plano.max_filas} filas simultâneas</li>
                ) : (
                  <li>Filas ilimitadas</li>
                )}
                {plano.max_clientes_por_fila ? (
                  <li>Até {plano.max_clientes_por_fila} clientes por fila</li>
                ) : (
                  <li>Clientes ilimitados por fila</li>
                )}
                {plano.recursos?.relatorios_basicos && (
                  <li>Relatórios básicos</li>
                )}
                {plano.recursos?.relatorios_avancados && (
                  <li>Relatórios avançados</li>
                )}
                {plano.recursos?.suporte_email && (
                  <li>Suporte por email</li>
                )}
                {plano.recursos?.suporte_prioritario && (
                  <li>Suporte prioritário</li>
                )}
                {plano.recursos?.api_access && (
                  <li>Acesso à API</li>
                )}
              </ul>
            </div>

            <button 
              onClick={handleRenovarPlano}
              disabled={paymentLoading}
              className="btn-renovar"
            >
              {paymentLoading ? 'Processando...' : `Renovar por R$ ${plano.preco}/mês`}
            </button>
          </div>
        </div>

        <div className="payment-info">
          <h3>Informações de Renovação</h3>
          <p>Você será redirecionado para o Mercado Pago para finalizar o pagamento da renovação.</p>
          <p>Métodos aceitos: Cartão de crédito, débito, PIX e boleto bancário.</p>
        </div>
      </div>
    </Layout>
  );
}
