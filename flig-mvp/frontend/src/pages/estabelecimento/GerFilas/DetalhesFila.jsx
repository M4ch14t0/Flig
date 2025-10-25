import React, { useState, useEffect } from 'react';
import { FiUsers, FiClock, FiArrowUpCircle, FiChevronLeft } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard, Users, Clock, DollarSign, Settings } from 'lucide-react';
import { api } from '../../../services/api';
import styles from './DetalhesFila.module.css';

export default function DetalhesFila() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fila, setFila] = useState(null);
  const [clients, setClients] = useState([]);
  const [groupedClients, setGroupedClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempoEsperaStats, setTempoEsperaStats] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [autoCallConfig, setAutoCallConfig] = useState({
    ativar: false,
    intervalo: 5
  });
  const [autoCallStatus, setAutoCallStatus] = useState(null);

  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} />, active: true },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} /> },
  ];

  useEffect(() => {
    if (id) {
      fetchFilaDetails();
    }
  }, [id]);

  const fetchFilaDetails = async () => {
    try {
      setLoading(true);
      
      // Buscar detalhes da fila
      const filaResponse = await api.get(`/api/queues/${id}`);
      if (filaResponse.data.success) {
        setFila(filaResponse.data.data);
      }

      // Buscar clientes da fila (com parâmetro isEstablishment para obter dados completos)
      const clientsResponse = await api.get(`/api/queues/${id}/clients?isEstablishment=true`);
      if (clientsResponse.data.success) {
        setClients(clientsResponse.data.data.clients || []);
      }

      // Buscar clientes agrupados para visualização bidimensional
      const groupedResponse = await api.get(`/api/queues/${id}/grouped`);
      if (groupedResponse.data.success) {
        setGroupedClients(groupedResponse.data.data.groupedClients || {});
      }

      // Buscar estatísticas de tempo de espera
      try {
        const tempoResponse = await api.get(`/api/queues/${id}/tempo-espera?t=${Date.now()}`);
        if (tempoResponse.data.success) {
          console.log('📊 Dados de tempo de espera recebidos:', tempoResponse.data.data);
          setTempoEsperaStats(tempoResponse.data.data);
        }
      } catch (tempoErr) {
        console.warn('Erro ao buscar estatísticas de tempo de espera:', tempoErr);
        // Não falhar a operação por causa das estatísticas
      }
    } catch (err) {
      setError('Erro ao carregar detalhes da fila');
      console.error('Erro ao buscar detalhes da fila:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const calculateWaitTime = (position) => {
    // Se temos dados de INTERVALO entre chamadas (tempo de atendimento real)
    if (tempoEsperaStats && tempoEsperaStats.intervalo && parseFloat(tempoEsperaStats.intervalo.medio) > 0) {
      const intervaloMedio = parseFloat(tempoEsperaStats.intervalo.medio);
      // Fórmula: (posição - 1) × intervalo médio entre chamadas
      const tempoCalculado = Math.max(0, (position - 1) * intervaloMedio);
      
      // Se o tempo é muito baixo (< 1 min), mostrar em segundos
      if (tempoCalculado < 1) {
        const segundos = Math.round(tempoCalculado * 60);
        return segundos > 0 ? `${segundos}s` : '0s';
      }
      
      return Math.round(tempoCalculado);
    }
    
    // Fallback: se não há dados de intervalo, usar tempo estimado da fila
    if (fila && fila.tempo_estimado) {
      const tempoCalculado = Math.max(0, (position - 1) * Number(fila.tempo_estimado));
      return Math.round(tempoCalculado);
    }
    
    // Se não há dados, mostrar "Sem dados"
    return "Sem dados";
  }

  const getTotalPeopleInQueue = () => {
    let total = 0;
    for (const position in groupedClients) {
      for (const client of groupedClients[position]) {
        if (client.isGroupLeader) {
          total += client.groupSize || 1;
        } else {
          total += 1;
        }
      }
    }
    return total;
  }

  // Funções para gerenciar o popup de edição
  const handleOpenEditPopup = async () => {
    setShowEditPopup(true);
    await fetchAutoCallStatus();
  };

  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
  };

  const fetchAutoCallStatus = async () => {
    try {
      const response = await api.get(`/api/queues/${id}/chamada-automatica/status`);
      if (response.data.success) {
        setAutoCallStatus(response.data.data);
      }
    } catch (error) {
      console.warn('Erro ao buscar status da chamada automática:', error);
    }
  };

  const handleConfigurarAutoCall = async () => {
    try {
      const response = await api.post(`/api/queues/${id}/chamada-automatica/configurar`, autoCallConfig);
      if (response.data.success) {
        await fetchAutoCallStatus();
        await fetchFilaDetails();
        console.log('✅ Configuração de chamada automática atualizada');
      }
    } catch (error) {
      console.error('Erro ao configurar chamada automática:', error);
    }
  };

  const handleExecutarAutoCall = async () => {
    try {
      const response = await api.post(`/api/queues/${id}/chamada-automatica/executar`);
      if (response.data.success) {
        await fetchAutoCallStatus();
        await fetchFilaDetails();
        console.log('✅ Chamada automática executada');
      }
    } catch (error) {
      console.error('Erro ao executar chamada automática:', error);
    }
  };


  if (loading) {
    return (
      <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
        <div className={styles.wrapper}>
          <div className={styles.loading}>Carregando detalhes da fila...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
        <div className={styles.wrapper}>
          <div className={styles.error}>{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <div className={styles.wrapper}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <FiChevronLeft /> Voltar
        </button>
        
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FiUsers /> {fila?.nome || 'Detalhes da Fila'}
          </h1>
          <button 
            onClick={handleOpenEditPopup}
            className={styles.editButton}
            title="Configurar chamadas automáticas"
          >
            <Settings size={16} />
          </button>
        </div>

        {fila && (
          <div className={styles.cards}>
            <div className={styles.card}>
              <Users size={28} />
              <h2>Total de Pessoas</h2>
              <p>{getTotalPeopleInQueue()}</p>
            </div>
            <div className={styles.card}>
              <DollarSign size={28} />
              <h2>Valor por Avanço</h2>
              <p>R$ {parseFloat(fila.valor_avancos || 0).toFixed(2)}</p>
            </div>
            <div className={styles.card}>
              <FiArrowUpCircle size={28} />
              <h2>Status</h2>
              <p className={fila.status === 'ativa' ? styles.statusActive : styles.statusPaused}>
                {fila.status === 'ativa' ? 'Ativa' : 'Pausada'}
              </p>
            </div>
            {tempoEsperaStats && (
              <>
                <div className={styles.card}>
                  <Clock size={28} />
                  <h2>Intervalo entre Chamadas</h2>
                  <p className={styles.tempoMedio}>
                    {tempoEsperaStats.intervalo && parseFloat(tempoEsperaStats.intervalo.medio) > 0 
                      ? (() => {
                          const valor = parseFloat(tempoEsperaStats.intervalo.medio);
                          if (valor < 1) {
                            const segundos = Math.round(valor * 60);
                            return `${segundos}s`;
                          }
                          return `${valor.toFixed(1)} min`;
                        })()
                      : 'Sem dados'
                    }
                  </p>
                  {tempoEsperaStats.intervalo?.totalCalculados > 0 && (
                    <small className={styles.totalAtendidos}>
                      Baseado em {tempoEsperaStats.intervalo.totalCalculados} chamadas
                    </small>
                  )}
                </div>
                <div className={styles.card}>
                  <Clock size={28} />
                  <h2>Tempo Médio de Espera</h2>
                  <p className={styles.tempoMedio}>
                    {tempoEsperaStats.fila?.tempoMedio > 0 
                      ? `${Math.round(tempoEsperaStats.fila.tempoMedio)} min`
                      : 'Sem dados'
                    }
                  </p>
                  {tempoEsperaStats.fila?.totalAtendidos > 0 && (
                    <small className={styles.totalAtendidos}>
                      Baseado em {tempoEsperaStats.fila.totalAtendidos} atendimentos
                    </small>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className={styles.main}>
          <h2>Fila Bidimensional - Visão do Estabelecimento</h2>
          
          {Object.keys(groupedClients).length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhum cliente na fila no momento.</p>
            </div>
          ) : (
            <div className={styles.bidimensionalQueue}>
              {Object.entries(groupedClients).map(([position, clientsAtPosition]) => (
                <div key={position} className={styles.positionGroup}>
                  <div className={styles.positionHeader}>
                    <h4>Posição {position}</h4>
                    <span className={styles.positionCount}>
                      {clientsAtPosition.length} cliente{clientsAtPosition.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={styles.clientsAtPosition}>
                    {clientsAtPosition.map((client, index) => (
                      <div 
                        key={client.id} 
                        className={`${styles.clientCard} ${client.paidAdvance ? styles.paidClient : ''} ${client.isGroupLeader ? styles.groupLeader : ''}`}
                      >
                        <div className={styles.clientPosition}>
                          <span className={styles.positionNumber}>
                            {position}{client.subPosition || 'a'}
                          </span>
                          {client.paidAdvance && (
                            <span className={styles.paidBadge}>PAGOU</span>
                          )}
                          {client.isGroupLeader && (
                            <span className={styles.groupBadge}>GRUPO</span>
                          )}
                        </div>
                        <div className={styles.clientInfo}>
                          <h4>{client.nome}</h4>
                          <div className={styles.clientContact}>
                            <div className={styles.contactItem}>
                              <span>📧 {client.email}</span>
                            </div>
                            <div className={styles.contactItem}>
                              <span>📱 {client.telefone}</span>
                            </div>
                          </div>
                          
                          {client.isGroupLeader && (
                            <div className={styles.groupInfo}>
                              <Users size={12} />
                              <span>Líder ({client.groupSize} pessoas)</span>
                            </div>
                          )}
                          
                          {client.isGroupLeader && client.groupMembers && (
                            <div className={styles.groupMembers}>
                              <strong>Membros do grupo:</strong>
                              <ul>
                                {client.groupMembers.map((member, memberIndex) => (
                                  <li key={memberIndex}>
                                    <strong>{member.nome}</strong>
                                    <br />
                                    <small>
                                      📧 {member.email} | 📱 {member.telefone}
                                    </small>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className={styles.clientDetails}>
                            <div className={styles.detailItem}>
                              <Clock size={12} />
                              <span>{calculateWaitTime(client.position)} min</span>
                            </div>
                            {client.isGroupLeader && (
                              <div className={styles.detailItem}>
                                <Users size={12} />
                                <span>{client.groupSize} pessoas</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popup de Configuração */}
      {showEditPopup && (
        <div className={styles.popupOverlay} onClick={handleCloseEditPopup}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <h3>Configurar Chamadas Automáticas</h3>
              <button onClick={handleCloseEditPopup} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.popupContent}>
              <div className={styles.configSection}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={autoCallConfig.ativar}
                    onChange={(e) => setAutoCallConfig({ ...autoCallConfig, ativar: e.target.checked })}
                  />
                  <span>Ativar chamada automática</span>
                </label>

                        {autoCallConfig.ativar && (
                          <div className={styles.field}>
                            <label>
                              <Clock size={16} />
                              Intervalo (minutos):
                              <input
                                type="number"
                                min="1"
                                max="60"
                                value={autoCallConfig.intervalo}
                                onChange={(e) => setAutoCallConfig({ ...autoCallConfig, intervalo: parseInt(e.target.value) })}
                              />
                            </label>
                          </div>
                        )}

                <button
                  onClick={handleConfigurarAutoCall}
                  className={styles.configButton}
                >
                  Salvar Configuração
                </button>
              </div>

              {autoCallStatus && (
                <div className={styles.statusSection}>
                  <h4>Status Atual</h4>
                  <div className={styles.statusItem}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.value} ${autoCallStatus.precisaChamada ? styles.active : styles.inactive}`}>
                      {autoCallStatus.precisaChamada ? 'Pronto para chamada' : autoCallStatus.motivo}
                    </span>
                  </div>

                  {autoCallStatus.proximoCliente && (
                    <div className={styles.statusItem}>
                      <Users size={16} />
                      <span>Próximo: {autoCallStatus.proximoCliente.nome}</span>
                    </div>
                  )}

                  {autoCallStatus.totalClientes && (
                    <div className={styles.statusItem}>
                      <span>Total na fila: {autoCallStatus.totalClientes}</span>
                    </div>
                  )}

                  <button
                    onClick={handleExecutarAutoCall}
                    disabled={!autoCallStatus.precisaChamada}
                    className={styles.executeButton}
                  >
                    Executar Chamada Agora
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
