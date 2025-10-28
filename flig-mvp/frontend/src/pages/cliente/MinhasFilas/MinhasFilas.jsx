import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, List, LogOut, X, ChevronUp, Users, ArrowLeft } from 'lucide-react';
import Layout from '../../../components/Layout';
import GroupQueueComponent from '../../../components/GroupQueueComponent';
import MercadoPagoButton from '../../../components/MercadoPagoButton';
import { api } from '../../../services/api';
import { AuthContext } from '../../../contexts/authContextImports';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './MinhasFilas.module.css';

function MinhasFilas() {
  const navigate = useNavigate();
  const { user, userType } = useContext(AuthContext);
  const { theme } = useTheme();
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [queueClients, setQueueClients] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState(1);
  const [viewingQueue, setViewingQueue] = useState(null);
  const [showPaymentButton, setShowPaymentButton] = useState(false);

  const sidebarLinks = [
    {
      to: '/cliente/home',
      label: 'Home',
      icon: <Home size={16} />
    },
    {
      to: '/cliente/estabelecimentos',
      label: 'Estabelecimentos',
      icon: <MapPin size={16} />
    },
    {
      to: '/cliente/minhas-filas',
      label: 'Minhas Filas',
      icon: <List size={16} />,
      active: true
    }
  ];

  // Buscar filas do usuário
  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!user) {
      setError('Usuário não autenticado. Faça login para continuar.');
      setLoading(false);
      return;
    }
    
    // Verificar se o usuário é do tipo 'cliente'
    if (userType && userType !== 'cliente') {
      // Redirecionar para a página correta baseada no tipo de usuário
      if (userType === 'estabelecimento') {
        navigate('/estabelecimento/home');
        return;
      } else {
        setError('Acesso negado. Esta página é apenas para clientes.');
        setLoading(false);
        return;
      }
    }
    
    fetchUserQueues();
  }, [user, userType, navigate]);

  const fetchUserQueues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/users/active-queues');
      const data = response.data;
      
      if (data.success) {
        setFilas(data.data);
      } else {
        setError('Erro ao carregar suas filas');
      }
    } catch (err) {
      console.error('Erro ao buscar filas do usuário:', err);
      setError('Erro ao carregar suas filas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQueue = (fila) => {
    setViewingQueue(fila);
  };

  const handleBackToQueues = () => {
    setViewingQueue(null);
  };

  const handleAdvancePosition = async (queueId, currentPosition) => {
    try {
      const userId = localStorage.getItem('userId_cliente');
      if (!userId) {
        alert('Usuário não identificado');
        return;
      }

      const currentQueue = filas.find(f => f.id === queueId);
      if (!currentQueue) {
        alert('Fila não encontrada');
        return;
      }

      const response = await api.get(`/api/queues/${queueId}/clients`);
      const clientsData = response.data;
      
      if (!clientsData.success || !Array.isArray(clientsData.data.clients)) {
        alert('Erro ao verificar dados da fila');
        return;
      }

      if (clientsData.data.clients.length <= 1) {
        alert('Não é possível avançar posições quando há apenas uma pessoa na fila');
        return;
      }

      // Abrir popup com dados da fila
      setSelectedQueue(currentQueue);
      setQueueClients(clientsData.data.clients);
      setSelectedPositions(1);
      setShowAdvancePopup(true);
    } catch (err) {
      console.error('Erro ao verificar fila:', err);
      alert('Erro ao verificar dados da fila');
    }
  };

  const handleLeaveQueue = async (queueId) => {
    try {
      const response = await api.delete(`/api/queues/${queueId}/leave`);
      if (response.data.success) {
        fetchUserQueues();
      }
    } catch (err) {
      console.error('Erro ao sair da fila:', err);
    }
  };

  const closeAdvancePopup = () => {
    setShowAdvancePopup(false);
    setSelectedQueue(null);
    setQueueClients([]);
    setSelectedPositions(1);
    setShowPaymentButton(false);
  };

  const handleConfirmAdvance = async () => {
    if (!selectedQueue) return;

    const userId = localStorage.getItem('userId_cliente');
    const maxAdvance = getMaxAdvance();

    if (selectedPositions > maxAdvance) {
      alert(`Você só pode avançar no máximo ${maxAdvance} posições`);
      return;
    }

    try {
      console.log('🎯 Executando avanço via API (fluxo original)...');
      console.log('Fila selecionada:', selectedQueue);
      console.log('Posições a avançar:', selectedPositions);
      console.log('userId:', userId);

      // Buscar o cliente correto na fila
      const userEmail = localStorage.getItem('userEmail_cliente');
      const userName = localStorage.getItem('userName_cliente');
      console.log('🔍 Procurando cliente por email:', userEmail);
      console.log('🔍 Procurando cliente por nome:', userName);
      
      // Buscar clientes da fila para encontrar o cliente correto
      const clientsResponse = await api.get(`/api/queues/${selectedQueue.id}/clients`);
      console.log('🔍 Resposta da API de clientes:', clientsResponse.data);
      
      const clients = clientsResponse.data.data.clients;
      console.log('🔍 Clientes na fila:', clients);
      
      // Encontrar o cliente atual pelo nome
      const currentClient = clients.find(client => {
        const matchName = client.nome === userName;
        console.log(`🔍 Cliente ${client.nome}: nome=${client.nome} (${matchName})`);
        return matchName;
      });
      
      if (!currentClient) {
        console.log('❌ Cliente não encontrado. Dados disponíveis:');
        console.log('   - userEmail:', userEmail);
        console.log('   - userName:', userName);
        console.log('   - Clientes na fila:', clients.map(c => ({ nome: c.nome, email: c.email })));
        console.log('   - localStorage completo:');
        Object.keys(localStorage).forEach(key => {
          console.log(`     ${key}:`, localStorage.getItem(key));
        });
        console.log('   - Tentando buscar por diferentes chaves:');
        console.log('     - name:', localStorage.getItem('name'));
        console.log('     - userName:', localStorage.getItem('userName'));
        console.log('     - user_name:', localStorage.getItem('user_name'));
        console.log('     - nome:', localStorage.getItem('nome'));
        throw new Error('Cliente não encontrado na fila');
      }
      
      console.log('✅ Cliente encontrado:', currentClient);
      console.log('   ID na fila:', currentClient.id);
      console.log('   Posição atual:', currentClient.position);

      // FLUXO ORIGINAL: Chamar API do backend
      const response = await api.post(`/api/queues/${selectedQueue.id}/advance`, {
        clientId: currentClient.id, // Usar o ID correto do cliente na fila
        positions: selectedPositions
        // paymentData removido - backend vai pular validação de pagamento
      });

      console.log('✅ Resposta da API:', response.data);

      if (response.data.success) {
        const { oldPosition, newPosition, positionsAdvanced, estimatedTime, amount } = response.data.data;
        
        console.log(`🎉 Avanço realizado! De posição ${oldPosition} para ${newPosition}`);
        console.log(`💰 Valor: R$ ${amount} (não processado)`);
        console.log(`⏱️ Tempo estimado: ${estimatedTime}min`);

        // Atualizar interface com dados da API
        const updatedQueue = {
          ...selectedQueue,
          posicao_atual: newPosition
        };
        setSelectedQueue(updatedQueue);

        // Atualizar a lista de filas
        setFilas(prevFilas =>
          prevFilas.map(fila =>
            fila.id === selectedQueue.id
              ? { ...fila, posicao_atual: newPosition }
              : fila
          )
        );

        // Mostrar mensagem de sucesso
        alert(`🎉 Avanço realizado! Sua nova posição é ${newPosition}ª`);

        // Mostrar botão do Mercado Pago
        setShowPaymentButton(true);

        // Fechar popup de avanço
        closeAdvancePopup();

      } else {
        throw new Error(response.data.message || 'Erro ao avançar na fila');
      }

    } catch (error) {
      console.error('❌ Erro ao avançar na fila:', error);
      alert(`Erro ao avançar na fila: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePaymentSuccess = (result) => {
    console.log('✅ Pagamento processado:', result);
    // Não fechar o popup aqui, deixar o MercadoPagoButton fazer o redirecionamento
    // O popup será fechado quando o usuário voltar para a página
    fetchUserQueues(); // Recarrega as filas para mostrar nova posição
  };

  const handlePaymentError = (error) => {
    console.error('Erro no pagamento:', error);
    alert('Erro no pagamento. Tente novamente.');
  };

  const getMaxAdvance = () => {
    if (!selectedQueue || !queueClients.length) return 1;
    
    // Limite baseado no estabelecimento (max_avancos da fila)
    const establishmentLimit = selectedQueue.max_avancos || 8;
    
    // Limite baseado na posição atual (pode avançar até a posição 1)
    const maxAdvanceByPosition = selectedQueue.posicao_atual - 1;
    
    // Retorna o menor entre os dois limites, mas pelo menos 1
    return Math.max(1, Math.min(establishmentLimit, maxAdvanceByPosition));
  };

  const calculateAdvancePrice = (positions) => {
    const initialPrice = 10.00; // R$ 10,00 inicial
    const interestRate = 0.15; // 15% de juros
    
    if (positions <= 0) return 0;
    if (positions === 1) return initialPrice;
    
    // Juros compostos: P * (1 + r)^n
    const totalPrice = initialPrice * Math.pow(1 + interestRate, positions - 1);
    
    // Arredonda para 2 casas decimais
    return Math.round(totalPrice * 100) / 100;
  };

  return (
    <Layout
      sidebarLinks={sidebarLinks}
      userType="cliente"
      showFooter={false}
    >
      <div className={styles.container}>
        {viewingQueue ? (
          <div className={styles.queueView}>
            <button 
              className={styles.backButton}
              onClick={handleBackToQueues}
            >
              <ArrowLeft size={16} />
              Voltar para Minhas Filas
            </button>
            
            <GroupQueueComponent
              queueId={viewingQueue.id}
              establishmentId={viewingQueue.estabelecimento_id}
              onJoinSuccess={() => {
                fetchUserQueues();
                setViewingQueue(null);
              }}
              onError={(message) => alert(`Erro: ${message}`)}
            />
          </div>
        ) : loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            Carregando suas filas...
          </div>
        ) : error ? (
          <div className={styles.error}>
            <h2 className={styles.errorTitle}>Erro ao carregar filas</h2>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={fetchUserQueues} className={styles.retryBtn}>
              Tentar Novamente
            </button>
          </div>
        ) : filas.length > 0 ? (
          <div className={styles.filasContainer}>
            {filas.map((fila, index) => (
              <div key={fila.id} className={styles.filaCard}>
                {/* Área da Imagem */}
                <div className={styles.filaImageArea}>
                  <img src={fila.imagem_estabelecimento} alt={fila.estabelecimento_nome} />
                </div>

                {/* Informações da Fila */}
                <div className={styles.filaInfo}>
                  <h1 className={styles.filaTitle}>
                    {fila.estabelecimento_nome || `Estabelecimento ${String.fromCharCode(65 + index)}`}
                  </h1>
                  
                  <div className={styles.filaDetails}>
                    <strong style={{ color: '#fff' }}>{fila.fila_nome || `Fila ${String.fromCharCode(65 + index)}`}</strong> - {fila.total_pessoas_fila} pessoas
                  </div>
                  
                  <div className={styles.filaPosition}>
                    <strong style={{ color: '#fff' }}>Posição</strong> - {fila.posicao_atual}º
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className={styles.actionButtons}>
                  

                  <button onClick={() => handleLeaveQueue(fila.id)} className={styles.sairBtn}>
                    Sair <LogOut size={14} />
                  </button>

                  <button onClick={() => handleAdvancePosition(fila.id, fila.posicao_atual)} className={styles.avanBtn}>
                    Avançar Posições
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <List size={32} />
            </div>
            <h2 className={styles.emptyTitle}>
              Você não está em nenhuma fila
            </h2>
            <p className={styles.emptyMessage}>
              Explore estabelecimentos e entre em filas para acompanhar aqui
            </p>
            <button onClick={() => navigate('/cliente/estabelecimentos')} className={styles.exploreBtn}>
              Explorar Estabelecimentos
            </button>
          </div>
        )}
      </div>

      {/* Popup de Avançar Posições */}
      {showAdvancePopup && selectedQueue && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <div className={styles.popupHeader}>
              <h2 className={styles.popupTitle}>Avançar Posições</h2>
              <button onClick={closeAdvancePopup} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.popupBody}>
              <div className={styles.queueInfo}>
                <h3 className={styles.queueName}>{selectedQueue.estabelecimento_nome}</h3>
                <p className={styles.queueDetails}>
                  <strong>{selectedQueue.fila_nome}</strong> - Posição atual: {selectedQueue.posicao_atual}º
                </p>
                <p className={styles.queueStats}>
                  Total de pessoas na fila: {selectedQueue.total_pessoas_fila}
                </p>
              </div>

              <div className={styles.advanceSelector}>
                <label className={styles.selectorLabel}>
                  Quantas posições avançar?
                </label>
                <div className={styles.positionControls}>
                  <button 
                    onClick={() => setSelectedPositions(Math.max(1, selectedPositions - 1))}
                    className={styles.positionBtn}
                    disabled={selectedPositions <= 1}
                  >
                    -
                  </button>
                  <span className={styles.positionValue}>{selectedPositions}</span>
                  <button 
                    onClick={() => setSelectedPositions(Math.min(getMaxAdvance(), selectedPositions + 1))}
                    className={styles.positionBtn}
                    disabled={selectedPositions >= getMaxAdvance()}
                  >
                    +
                  </button>
                </div>
                <p className={styles.maxAdvanceInfo}>
                  Máximo: {getMaxAdvance()} posições
                  {selectedQueue && (
                    <span className={styles.limitDetails}>
                      (Limite do estabelecimento: {selectedQueue.max_avancos || 8}, Posição atual: {selectedQueue.posicao_atual})
                    </span>
                  )}
                </p>
              </div>

              <div className={styles.paymentInfo}>
                <div className={styles.paymentSummary}>
                  <div className={styles.paymentRow}>
                    <span>Preço base:</span>
                    <span>R$ 10,00</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Posições a avançar:</span>
                    <span>{selectedPositions}</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Taxa de juros:</span>
                    <span>15% por posição</span>
                  </div>
                  <div className={styles.paymentTotal}>
                    <span>Total:</span>
                    <span>R$ {calculateAdvancePrice(selectedPositions).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.popupFooter}>
              {!showPaymentButton ? (
                <>
                  <button onClick={closeAdvancePopup} className={styles.cancelBtn}>
                    Cancelar
                  </button>
                  <button onClick={handleConfirmAdvance} className={styles.confirmBtn}>
                    <ChevronUp size={16} />
                    Avançar {selectedPositions} {selectedPositions === 1 ? 'posição' : 'posições'}
                  </button>
                </>
              ) : (
                <div className={styles.paymentSection}>
                  <div className={styles.paymentHeader}>
                    <h4>Finalizar Pagamento</h4>
                    <p>Complete o pagamento para avançar na fila</p>
                  </div>
                  
                  <MercadoPagoButton
                    queueId={selectedQueue?.id}
                    positions={selectedPositions}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  
                  <button 
                    onClick={() => setShowPaymentButton(false)} 
                    className={styles.backBtn}
                    style={{ marginTop: '10px' }}
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default MinhasFilas;