import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, List, CreditCard, ArrowLeft } from 'lucide-react';
import Layout from '../../../components/Layout';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/authContextImports.js';
import './AssinarPlano.module.css';

export default function AssinarPlano() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
    const fetchPlano = async () => {
      try {
        setLoading(true);
        const planoId = location.state?.planoId || 2; // Default para plano Essencial
        
        // Simula dados do plano
        const planoSimulado = {
          id: planoId,
          nome: 'Plano Essencial',
          preco: 39.90,
          duracao: 30,
          descricao: 'Plano básico para pequenos estabelecimentos',
          recursos: [
            'Até 3 filas simultâneas',
            'Dashboard básico',
            'Relatórios simples',
            'Suporte por email'
          ]
        };
        
        setPlano(planoSimulado);
      } catch (err) {
        console.error('Erro ao buscar plano:', err);
        setError('Erro ao carregar dados do plano');
      } finally {
        setLoading(false);
      }
    };

    fetchPlano();
  }, [location.state]);

  const handleAssinarPlano = async () => {
    setPaymentLoading(true);
    
    try {
      // SIMULAÇÃO DE PAGAMENTO
      console.log('Simulando assinatura do plano...', {
        planoId: plano.id,
        estabelecimentoId: user?.id,
        valor: plano.preco
      });

      // Simula delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simula sucesso
      alert('Plano assinado com sucesso! (Modo teste)');
      navigate('/estabelecimento/planos');
      
    } catch (err) {
      console.error('Erro ao assinar plano:', err);
      alert('Erro ao processar assinatura. Tente novamente.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
        <div className="loading">Carregando...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
        <div className="error">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <div className="assinar-plano-container">
        <div className="header">
          <button 
            className="back-button" 
            onClick={() => navigate('/estabelecimento/planos')}
          >
            <ArrowLeft size={16} />
          </button>
          <h1>Assinar Plano</h1>
        </div>

        <div className="plano-info">
          <div className="plano-details">
            <h2>{plano.nome}</h2>
            <p className="descricao">{plano.descricao}</p>
            
            <div className="duracao-info">
              <div className="info-item">
                <strong>Duração:</strong> {plano.duracao} dias
              </div>
              <div className="info-item">
                <strong>Expira em:</strong> {new Date(Date.now() + plano.duracao * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
              <div className="info-item">
                <strong>Tempo restante:</strong> {plano.duracao} dias
              </div>
            </div>

            <div className="recursos">
              <h3>Recursos incluídos:</h3>
              <ul>
                {plano.recursos.map((recurso, index) => (
                  <li key={index}>{recurso}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="payment-section">
            <div className="payment-details">
              <h3>Detalhes do Pagamento</h3>
              <div className="price-info">
                <div className="price-item">
                  <span>Valor do produto:</span>
                  <span>R$ {plano.preco.toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Desconto:</span>
                  <span>R$ 0,00</span>
                </div>
                <hr />
                <div className="price-total">
                  <span>Total a pagar:</span>
                  <span>R$ {plano.preco.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="payment-methods">
              <h4>Forma de Pagamento</h4>
              <div className="method-selected">
                <input type="radio" id="credit-card" name="payment" defaultChecked />
                <label htmlFor="credit-card">Cartão de Crédito (Simulado)</label>
              </div>
            </div>

            <div className="terms">
              <label>
                <input type="checkbox" required />
                Li e concordo com a <a href="#">Política de Privacidade</a>
              </label>
              <label>
                <input type="checkbox" required />
                Li e concordo com os <a href="#">Termos de Uso</a>
              </label>
            </div>

            <button 
              className="confirm-button"
              onClick={handleAssinarPlano}
              disabled={paymentLoading}
            >
              {paymentLoading ? 'Processando...' : 'Confirmar Assinatura (Simulado)'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}