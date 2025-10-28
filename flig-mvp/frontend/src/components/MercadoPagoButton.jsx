import React, { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Chave pública do Mercado Pago
const publicKey = 'APP_USR-7b82f4ea-52b3-4ce2-b132-c0898d967004';

// Flag global para controlar inicialização
let mercadoPagoInitialized = false;

const MercadoPagoButton = ({ queueId, positions, onSuccess, onError }) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializar Mercado Pago apenas uma vez globalmente
    if (!mercadoPagoInitialized) {
      try {
        console.log('🚀 Inicializando Mercado Pago SDK...');
        initMercadoPago(publicKey, { 
          locale: 'pt-BR',
          advancedFraudPrevention: false
        });
        mercadoPagoInitialized = true;
        console.log('✅ Mercado Pago SDK inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar Mercado Pago SDK:', error);
        setError('Erro ao carregar sistema de pagamento');
      }
    }
    
    createPreference();
  }, [queueId, positions]);

  const createPreference = async (retryCount = 0) => {
    if (!queueId || !positions) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Criando preferência de pagamento...', { queueId, positions });
      const response = await api.post('/api/payments/advance-preference', {
        queueId,
        positions
      });

      console.log('📋 Resposta da API:', response.data);

      if (response.data.success) {
        setPreferenceId(response.data.data.preferenceId);
        console.log('✅ Preferência criada com sucesso:', response.data.data.preferenceId);
        console.log('🔗 URL de pagamento:', response.data.data.initPoint);
      } else {
        console.error('❌ Erro na resposta da API:', response.data);
        setError(response.data.message || 'Erro ao criar preferência de pagamento');
      }
    } catch (error) {
      console.error('❌ Erro ao criar preferência:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Retry automático para erros de rede
      if (retryCount < 3 && (error.code === 'ERR_NETWORK' || error.response?.status >= 500)) {
        console.log(`🔄 Tentativa ${retryCount + 1} de 3...`);
        setTimeout(() => createPreference(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erro ao processar pagamento. Tente novamente.';
      setError(errorMessage);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    console.log('✅ Pagamento aprovado:', result);
    
    // Mostrar mensagem de sucesso
    alert('🎉 Pagamento aprovado! Você será redirecionado automaticamente.');
    
    // Chamar callback de sucesso
    if (onSuccess) onSuccess(result);
    
    // Redirecionar usando React Router
    setTimeout(() => {
      navigate('/cliente/minhas-filas');
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error('Erro no pagamento:', error);
    if (onError) onError(error);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px',
        color: '#666'
      }}>
        Carregando botão de pagamento...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: '#e74c3c', 
        textAlign: 'center', 
        padding: '10px',
        backgroundColor: '#ffeaea',
        border: '1px solid #e74c3c',
        borderRadius: '4px',
        margin: '10px 0'
      }}>
        {error}
      </div>
    );
  }

  if (!preferenceId) {
    return (
      <div style={{ 
        color: '#666', 
        textAlign: 'center', 
        padding: '20px' 
      }}>
        Preparando pagamento...
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%',
      maxWidth: '300px',
      margin: '0 auto'
    }}>
      <div style={{ 
        width: '100%',
        marginBottom: '10px'
      }}>
        <Wallet 
          initialization={{ 
            preferenceId: preferenceId 
          }}
          onSubmit={handlePaymentSuccess}
          onError={handlePaymentError}
          customization={{
            texts: {
              valueProp: 'smart_option'
            }
          }}
        />
      </div>
      
      {/* Fallback caso o Wallet não carregue */}
      <div style={{ 
        marginTop: '10px',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#666', 
          margin: '5px 0'
        }}>
          Pague com segurança
        </p>
        <a 
          href={`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#009ee3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            marginTop: '10px'
          }}
        >
          Abrir em nova aba
        </a>
      </div>
    </div>
  );
};

export default MercadoPagoButton;
