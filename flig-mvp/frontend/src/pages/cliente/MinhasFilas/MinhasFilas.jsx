import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, List, LogOut, X, ChevronUp } from 'lucide-react';
import Layout from '../../../components/Layout';
import { api } from '../../../services/api';
import { AuthContext } from '../../../contexts/authContextImports';
import styles from './MinhasFilas.module.css';

function MinhasFilas() {
  const navigate = useNavigate();
  const { user, userType } = useContext(AuthContext);
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [queueClients, setQueueClients] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState(1);

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
      
      const response = await api.get('/users/active-queues');
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

  const handleAdvancePosition = async (queueId, currentPosition) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Usuário não identificado');
        return;
      }

      const currentQueue = filas.find(f => f.id === queueId);
      if (!currentQueue) {
        alert('Fila não encontrada');
        return;
      }

      const response = await api.get(`/queues/${queueId}/clients`);
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
      const response = await api.delete(`/queues/${queueId}/leave`);
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
  };

  const handleConfirmAdvance = () => {
    if (!selectedQueue) return;

    const userId = localStorage.getItem('userId');
    const maxAdvance = getMaxAdvance();

    if (selectedPositions > maxAdvance) {
      alert(`Você só pode avançar no máximo ${maxAdvance} posições`);
      return;
    }

    closeAdvancePopup();

    navigate('/cliente/pagamento', {
      state: {
        queueData: {
          queueId: selectedQueue.id,
          queueName: selectedQueue.fila_nome,
          establishmentName: selectedQueue.estabelecimento_nome,
          currentPosition: selectedQueue.posicao_atual,
          advanceValue: parseFloat(selectedQueue.valor_avancos || 5),
          userId: parseInt(userId),
          positionsToAdvance: selectedPositions
        }
      }
    });
  };

  const getMaxAdvance = () => {
    if (!selectedQueue || !queueClients.length) return 1;
    
    // Limite baseado no estabelecimento (max_avancos da fila)
    const establishmentLimit = selectedQueue.max_avancos || 8;
    
    // Limite baseado no número de pessoas na frente
    const peopleInFront = selectedQueue.total_pessoas_fila - selectedQueue.posicao_atual;
    
    // Retorna o menor entre os dois limites
    return Math.min(establishmentLimit, peopleInFront);
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
      <div 
        style={{ 
          background: '#1F1F1F',
          minHeight: '100vh',
          width: '100%',
          padding: '60px 80px'
        }}
      >
        {loading ? (
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
                  Imagem da Fila
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
                      (Limite do estabelecimento: {selectedQueue.max_avancos || 8}, Pessoas na frente: {selectedQueue.total_pessoas_fila - selectedQueue.posicao_atual})
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
              <button onClick={closeAdvancePopup} className={styles.cancelBtn}>
                Cancelar
              </button>
              <button onClick={handleConfirmAdvance} className={styles.confirmBtn}>
                <ChevronUp size={16} />
                Avançar {selectedPositions} {selectedPositions === 1 ? 'posição' : 'posições'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default MinhasFilas;