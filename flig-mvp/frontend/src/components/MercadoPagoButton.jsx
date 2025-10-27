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
      initMercadoPago(publicKey, { 
        locale: 'pt-BR',
        advancedFraudPrevention: false
      });
      mercadoPagoInitialized = true;
    }
    
    createPreference();
  }, [queueId, positions]);

  const createPreference = async (retryCount = 0) => {
    if (!queueId || !positions) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/payments/advance-preference', {
        queueId,
        positions
      });

      if (response.data.success) {
        setPreferenceId(response.data.data.preferenceId);
        console.log('✅ Preferência criada com sucesso:', response.data.data.preferenceId);
      } else {
        setError(response.data.message || 'Erro ao criar preferência de pagamento');
      }
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      
      // Retry automático para erros de rede
      if (retryCount < 3 && (error.code === 'ERR_NETWORK' || error.response?.status >= 500)) {
        console.log(`🔄 Tentativa ${retryCount + 1} de 3...`);
        setTimeout(() => createPreference(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      setError('Erro ao processar pagamento. Tente novamente.');
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
      
      <p style={{ 
        fontSize: '12px', 
        color: '#666', 
        textAlign: 'center',
        margin: '5px 0 0 0'
      }}>
        Pague com segurança
      </p>
    </div>
  );
};

export default MercadoPagoButton;
