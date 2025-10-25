import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Clock, Users, MapPin, ArrowLeft, Phone, Home, List } from 'lucide-react';
import Layout from '../../../components/Layout';
import GroupQueueComponent from '../../../components/GroupQueueComponent';
import { api } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/authContextImports';
import styles from './DetEstabelecimentos.module.css';

function DetEstabelecimentos() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const estabelecimentoFromState = location.state?.estabelecimento;
  const { theme } = useTheme();
  const { user, userType } = useAuth();

  // Configuração da sidebar
  const sidebarLinks = [
    {
      to: '/cliente/home',
      label: 'Home',
      icon: <Home size={16} />
    },
    {
      to: '/cliente/estabelecimentos',
      label: 'Estabelecimentos',
      icon: <MapPin size={16} />,
      active: true
    },
    {
      to: '/cliente/minhas-filas',
      label: 'Minhas Filas',
      icon: <List size={16} />
    }
  ];
  
  // Estados para dados do estabelecimento e filas
  const [establishment, setEstablishment] = useState(estabelecimentoFromState);
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);

  // Função para carregar dados do estabelecimento e filas
  const loadEstablishmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Se não temos dados do estabelecimento, busca pela API
      if (!establishment) {
        const establishmentResponse = await api.get(`/api/establishments/${id}`);
        if (establishmentResponse.data.success) {
          setEstablishment(establishmentResponse.data.data);
        }
      }

      // Busca filas do estabelecimento
      const queuesResponse = await api.get(`/api/establishments/${id}/queues`);
      console.log('🔍 Queues response:', queuesResponse.data);
      if (queuesResponse.data && queuesResponse.data.success && Array.isArray(queuesResponse.data.data)) {
        setFilas(queuesResponse.data.data);
      } else {
        console.warn('⚠️ Queues response não foi bem-sucedida ou não é array:', queuesResponse.data);
        setFilas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados quando o componente monta
  useEffect(() => {
    loadEstablishmentData();
  }, [id]);

  const handleError = (message) => {
    setError(message);
  };

  // Função para visualizar fila
  const handleViewQueue = (fila) => {
    if (fila.status !== 'ativa') {
      alert('Esta fila não está ativa no momento');
      return;
    }
    setSelectedQueue(fila);
  };

  // Função para voltar à lista de filas
  const handleBackToQueues = () => {
    setSelectedQueue(null);
  };

  // Função para sucesso na entrada na fila
  const handleJoinSuccess = (data) => {
    alert('Você entrou na fila com sucesso!');
    // Recarrega dados para mostrar a posição
    loadEstablishmentData();
    // Volta para a lista de filas
    setSelectedQueue(null);
  };

  // Função para erro na entrada na fila
  const handleJoinError = (message) => {
    alert(`Erro: ${message}`);
  };

  if (loading) {
    return (
      <Layout
        sidebarLinks={sidebarLinks}
        userType="cliente"
        showFooter={false}
      >
        <div className={styles.loading}>
          <Loader2 className={styles.loader} size={32} />
          <p>Carregando estabelecimento...</p>
        </div>
      </Layout>
    );
  }

  if (error || !establishment) {
    return (
      <Layout
        sidebarLinks={sidebarLinks}
        userType="cliente"
        showFooter={false}
      >
        <div className={styles.error}>
          <p>{error || 'Estabelecimento não encontrado'}</p>
          <button onClick={() => navigate('/cliente/estabelecimentos')}>
            Voltar para Estabelecimentos
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      sidebarLinks={sidebarLinks}
      userType="cliente"
      showFooter={false}
    >
      <div className={styles.container}>
          {/* Botão Voltar */}
          <button 
            className={styles.backButton}
            onClick={() => navigate('/cliente/estabelecimentos')}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          <div className={styles.estabCard}>
            <div className={styles.imageBox}></div>

            <div className={styles.infoBox}>
              <h2>{establishment.nome_empresa}</h2>
              
              <p className={styles.desc}>
                {establishment.descricao || 'Descrição não disponível.'}
              </p>
              
              <div className={styles.addressSection}>
                <p className={styles.label}>
                  <MapPin size={16} /> Endereço
                </p>
                <p>{establishment.endereco_empresa}</p>
              </div>
              
              <div className={styles.waitTimeSection}>
                <p className={styles.waitTime}>
                  Tempo médio de espera geral: {establishment.tempo_medio_espera || 15}min
                </p>
              </div>

              <div className={styles.filasSection}>
                <h3>
                  <Users size={20} /> Filas Disponíveis
                </h3>
                
                {filas.length === 0 ? (
                  <div className={styles.noQueues}>
                    <Users size={48} />
                    <h4>Nenhuma fila ativa</h4>
                    <p>Este estabelecimento não possui filas ativas no momento.</p>
                  </div>
                ) : (
                  <div className={styles.queuesTable}>
                    <div className={styles.tableHeader}>
                      <div className={styles.headerCell}>Filas</div>
                      <div className={styles.headerCell}>Pessoas</div>
                      <div className={styles.headerCell}>Média espera</div>
                      <div className={styles.headerCell}>Horário</div>
                      <div className={styles.headerCell}>Ação</div>
                    </div>
                    
                    {filas.map((fila) => (
                      <div key={fila.id} className={styles.tableRow}>
                        <div className={styles.tableCell}>
                          <span className={styles.queueName}>{fila.nome}</span>
                        </div>
                        <div className={styles.tableCell}>
                          <span className={styles.peopleCount}>{fila.clientes_na_fila || fila.total_clientes || 0}</span>
                        </div>
                        <div className={styles.tableCell}>
                          <span className={styles.waitTime}>{Number(fila.tempo_estimado || fila.tempo_medio_espera || 0)}min</span>
                        </div>
                        <div className={styles.tableCell}>
                          <span className={styles.schedule}>
                            {fila.status === 'ativa' ? 'Agora' : 'Fechada'}
                          </span>
                        </div>
                        <div className={styles.tableCell}>
                          <button 
                            className={styles.enterButton}
                            onClick={() => handleViewQueue(fila)}
                            disabled={fila.status !== 'ativa'}
                          >
                            {fila.status === 'ativa' ? 'Ver Fila' : 'Fechada'}
                            <Users size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Componente de Fila Bidimensional */}
          {selectedQueue && (
            <div className={styles.queueView}>
              <button 
                className={styles.backButton}
                onClick={handleBackToQueues}
              >
                <ArrowLeft size={16} />
                Voltar para Filas
              </button>
              
              <GroupQueueComponent
                queueId={selectedQueue.id}
                establishmentId={id}
                onJoinSuccess={handleJoinSuccess}
                onError={handleJoinError}
              />
            </div>
          )}
      </div>
    </Layout>
  );
}

export default DetEstabelecimentos;
