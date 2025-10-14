import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Clock, Users, MapPin, ArrowLeft, Phone, Home, List } from 'lucide-react';
import Layout from '../../../components/Layout';
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
  // selectedQueue removido - entrada direta na fila

  // Função para carregar dados do estabelecimento e filas
  const loadEstablishmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Se não temos dados do estabelecimento, busca pela API
      if (!establishment) {
        const establishmentResponse = await api.get(`/api/estabelecimentos/${id}`);
        if (establishmentResponse.data.success) {
          setEstablishment(establishmentResponse.data.data);
        }
      }

      // Busca filas do estabelecimento
      const queuesResponse = await api.get(`/api/estabelecimentos/${id}/filas`);
      if (queuesResponse.data && Array.isArray(queuesResponse.data)) {
        setFilas(queuesResponse.data);
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

  const handleJoinSuccess = (data) => {
    // Recarrega dados após entrar na fila
    loadEstablishmentData();
  };

  const handleError = (message) => {
    setError(message);
  };

  // Função para entrada direta na fila
  const handleEnterQueue = async (fila) => {
    if (!user || userType !== 'cliente') {
      alert('Usuário não autenticado');
      return;
    }

    if (fila.status !== 'ativa') {
      alert('Esta fila não está ativa no momento');
      return;
    }

    try {
      // Usa dados do usuário logado automaticamente
      const clientData = {
        nome: user.name || user.nome || '',
        telefone: user.telefone || user.phone || '',
        email: user.email || user.email_usuario || ''
      };

      console.log('🔍 Dados do usuário:', user);
      console.log('🔍 Dados sendo enviados:', clientData);

      // Verificar se os dados estão preenchidos
      if (!clientData.nome || !clientData.telefone || !clientData.email) {
        alert('Dados do usuário incompletos. Verifique seu perfil.');
        return;
      }

      const response = await api.post(`/api/queues/${fila.id}/join`, clientData);

      if (response.data.success) {
        alert('Você entrou na fila com sucesso!');
        // Recarrega dados para mostrar a posição
        await loadEstablishmentData();
        // Redireciona para minhas filas
        navigate('/cliente/minhas-filas');
      } else {
        alert(`Erro: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
      alert(error.response?.data?.message || 'Erro ao entrar na fila');
    }
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
                            onClick={() => handleEnterQueue(fila)}
                            disabled={fila.status !== 'ativa'}
                          >
                            {fila.status === 'ativa' ? 'Entrar' : 'Fechada'}
                            <ArrowLeft size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QueueComponent removido - entrada direta na fila */}
      </div>
    </Layout>
  );
}

export default DetEstabelecimentos;
