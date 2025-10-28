import React, { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Chave pública do Mercado Pago
const publicKey = 'APP_USR-7b82f4ea-52b3-4ce2-b132-c0898d967004';

// Flag global para controlar inicialização
let mercadoPagoInitialized = false;

const MercadoPagoButtonDebug = ({ queueId, positions, onSuccess, onError }) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  const navigate = useNavigate();

  const addDebugInfo = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newInfo = { timestamp, message, type };
    setDebugInfo(prev => [...prev, newInfo]);
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  useEffect(() => {
    addDebugInfo('Iniciando componente MercadoPagoButton', 'info');
    
    // Inicializar Mercado Pago apenas uma vez globalmente
    if (!mercadoPagoInitialized) {
      try {
        addDebugInfo('Inicializando Mercado Pago SDK...', 'info');
        initMercadoPago(publicKey, { 
          locale: 'pt-BR',
          advancedFraudPrevention: false
        });
        mercadoPagoInitialized = true;
        addDebugInfo('Mercado Pago SDK inicializado com sucesso', 'success');
      } catch (error) {
        addDebugInfo(`Erro ao inicializar Mercado Pago SDK: ${error.message}`, 'error');
        setError('Erro ao carregar sistema de pagamento');
      }
    }
    
    createPreference();
  }, [queueId, positions]);

  const createPreference = async (retryCount = 0) => {
    if (!queueId || !positions) {
      addDebugInfo('queueId ou positions não fornecidos', 'warning');
      return;
    }

    setLoading(true);
    setError(null);
    addDebugInfo(`Criando preferência - queueId: ${queueId}, positions: ${positions}`, 'info');

    try {
      const response = await api.post('/api/payments/advance-preference', {
        queueId,
        positions
      });

      addDebugInfo('Resposta da API recebida', 'info');
      addDebugInfo(`Status: ${response.status}`, 'info');
      addDebugInfo(`Dados: ${JSON.stringify(response.data)}`, 'info');

      if (response.data.success) {
        setPreferenceId(response.data.data.preferenceId);
        addDebugInfo(`Preferência criada com sucesso: ${response.data.data.preferenceId}`, 'success');
        addDebugInfo(`URL de pagamento: ${response.data.data.initPoint}`, 'info');
      } else {
        const errorMsg = response.data.message || 'Erro ao criar preferência de pagamento';
        addDebugInfo(`Erro na resposta da API: ${errorMsg}`, 'error');
        setError(errorMsg);
      }
    } catch (error) {
      addDebugInfo(`Erro na requisição: ${error.message}`, 'error');
      addDebugInfo(`Código: ${error.code}`, 'error');
      addDebugInfo(`Status: ${error.response?.status}`, 'error');
      addDebugInfo(`Dados do erro: ${JSON.stringify(error.response?.data)}`, 'error');
      
      // Retry automático para erros de rede
      if (retryCount < 3 && (error.code === 'ERR_NETWORK' || error.response?.status >= 500)) {
        addDebugInfo(`Tentativa ${retryCount + 1} de 3...`, 'warning');
        setTimeout(() => createPreference(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erro ao processar pagamento. Tente novamente.';
      addDebugInfo(`Erro final: ${errorMessage}`, 'error');
      setError(errorMessage);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    addDebugInfo('Pagamento aprovado!', 'success');
    addDebugInfo(`Resultado: ${JSON.stringify(result)}`, 'info');
    
    // Mostrar mensagem de sucesso
    alert('🎉 Pagamento aprovado! Você será redirecionado automaticamente.');
    
    // Chamar callback de sucesso
    if (onSuccess) onSuccess(result);
    
    // Redirecionar usando React Router
    setTimeout(() => {
      addDebugInfo('Redirecionando para /cliente/minhas-filas', 'info');
      navigate('/cliente/minhas-filas');
    }, 2000);
  };

  const handlePaymentError = (error) => {
    addDebugInfo(`Erro no pagamento: ${error.message}`, 'error');
    addDebugInfo(`Tipo do erro: ${error.type}`, 'error');
    addDebugInfo(`Código do erro: ${error.code}`, 'error');
    addDebugInfo(`Detalhes: ${JSON.stringify(error)}`, 'error');
    
    if (onError) onError(error);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px',
        color: '#666'
      }}>
        <div>Carregando botão de pagamento...</div>
        <div style={{ fontSize: '12px', marginTop: '10px' }}>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ 
              color: info.type === 'error' ? '#dc3545' : 
                    info.type === 'success' ? '#28a745' : 
                    info.type === 'warning' ? '#ffc107' : '#666',
              fontSize: '10px'
            }}>
              [{info.timestamp}] {info.message}
            </div>
          ))}
        </div>
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
        <div>{error}</div>
        <div style={{ fontSize: '12px', marginTop: '10px' }}>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ 
              color: info.type === 'error' ? '#dc3545' : 
                    info.type === 'success' ? '#28a745' : 
                    info.type === 'warning' ? '#ffc107' : '#666',
              fontSize: '10px'
            }}>
              [{info.timestamp}] {info.message}
            </div>
          ))}
        </div>
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
        <div style={{ fontSize: '12px', marginTop: '10px' }}>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ 
              color: info.type === 'error' ? '#dc3545' : 
                    info.type === 'success' ? '#28a745' : 
                    info.type === 'warning' ? '#ffc107' : '#666',
              fontSize: '10px'
            }}>
              [{info.timestamp}] {info.message}
            </div>
          ))}
        </div>
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

      {/* Debug info */}
      <div style={{ 
        marginTop: '20px',
        fontSize: '10px',
        color: '#666',
        maxHeight: '100px',
        overflowY: 'auto',
        width: '100%'
      }}>
        {debugInfo.map((info, index) => (
          <div key={index} style={{ 
            color: info.type === 'error' ? '#dc3545' : 
                  info.type === 'success' ? '#28a745' : 
                  info.type === 'warning' ? '#ffc107' : '#666',
            marginBottom: '2px'
          }}>
            [{info.timestamp}] {info.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MercadoPagoButtonDebug;
