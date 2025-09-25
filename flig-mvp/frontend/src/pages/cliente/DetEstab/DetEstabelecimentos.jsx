import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, User, Settings, LogOut, Loader2, Clock, Users, MapPin, ArrowLeft, Phone } from 'lucide-react';
import { api } from '../../../services/api';
import QueueComponent from '../../../components/QueueComponent';
import styles from './DetEstabelecimentos.module.css';

function DetEstabelecimentos() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const estabelecimentoFromState = location.state?.estabelecimento;
  
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
        const establishmentResponse = await api.get(`/estabelecimentos/${id}`);
        if (establishmentResponse.data.success) {
          setEstablishment(establishmentResponse.data.data);
        }
      }

      // Busca filas do estabelecimento
      const queuesResponse = await api.get(`/estabelecimentos/${id}/filas`);
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

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>
          <Loader2 className={styles.loader} size={32} />
          <p>Carregando estabelecimento...</p>
        </div>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>
          <p>{error || 'Estabelecimento não encontrado'}</p>
          <button onClick={() => navigate('/cliente/estabelecimentos')}>
            Voltar para Estabelecimentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo}>Flig</div>
        <div className={styles.headerRight}>
          <Link to="/faq" className={styles.helpIcon}><HelpCircle size={20} /></Link>
          <div className={styles.userIconWrapper}>
            <button className={styles.userIcon} onClick={() => navigate('/cliente/perfil')}><User size={20} /></button>
            <div className={styles.userPopup}>
              <p onClick={() => navigate('/cliente/perfil')}><User size={16} /> <u>Perfil</u></p>
              <p onClick={() => navigate('/cliente/configuracoes')}><Settings size={16} /> <u>Configurações</u></p>
              <p><LogOut size={16} /> <u>Sair</u></p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className={styles.content}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <nav className={styles.menu}>
            <Link to="/cliente/home" className={styles.homeActive}>🏠 Home</Link>
            <Link to="/cliente/estabelecimentos" className={styles.estabActive}>📍 Estabelecimentos</Link>
            <Link to="/cliente/minhas-filas" className={styles.filasActive}>👥 Minhas Filas</Link>
          </nav>
        </aside>

        <main className={styles.main}>
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
              <div className={styles.infoTop}>
                <div>
                  <h2>{establishment.nome_empresa}</h2>
                  <div className={styles.categoryBadge}>{establishment.categoria}</div>
                  <p className={styles.label}>Descrição</p>
                  <p className={styles.desc}>
                    {establishment.descricao || 'Descrição não disponível.'}
                  </p>
                </div>
                <div>
                  <p className={styles.label}>
                    <MapPin size={16} /> Endereço
                  </p>
                  <p>{establishment.endereco_empresa}</p>
                  {establishment.telefone_empresa && (
                    <p className={styles.tempo}>
                      <Phone size={16} /> {establishment.telefone_empresa}
                    </p>
                  )}
                  {establishment.horario_funcionamento && (
                    <p className={styles.tempo}>
                      <Clock size={16} /> {establishment.horario_funcionamento}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.avaliacao}>
                <h3>Status</h3>
                <p className={styles.status}>
                  Status: <span className={establishment.status === 'ativo' ? styles.active : styles.inactive}>
                    {establishment.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
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
                  <div className={styles.queuesList}>
                    {filas.map((fila) => (
                      <div 
                        key={fila.id}
                        className={`${styles.queueCard} ${selectedQueue?.id === fila.id ? styles.selected : ''}`}
                        onClick={() => setSelectedQueue(fila)}
                      >
                        <div className={styles.queueHeader}>
                          <h4>{fila.nome}</h4>
                          <span className={`${styles.status} ${styles[fila.status]}`}>
                            {fila.status}
                          </span>
                        </div>
                        
                        {fila.descricao && (
                          <p className={styles.queueDescription}>{fila.descricao}</p>
                        )}
                        
                        <div className={styles.queueInfo}>
                          <div className={styles.infoItem}>
                            <Clock size={14} />
                            <span>{Number(fila.tempo_estimado || 0)} min por posição</span>
                          </div>
                          <div className={styles.infoItem}>
                            <Users size={14} />
                            <span>{fila.stats?.totalClients || 0} pessoas</span>
                          </div>
                          <div className={styles.infoItem}>
                            <span>R$ {Number(fila.valor_avancos || 0).toFixed(2)} por avanço</span>
                          </div>
                        </div>
                        
                        <button 
                          className={styles.selectQueueButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQueue(fila);
                          }}
                        >
                          {selectedQueue?.id === fila.id ? 'Selecionada' : 'Selecionar Fila'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Componente de Fila */}
          {selectedQueue && (
            <div className={styles.queueComponent}>
              <h3>Fila Selecionada: {selectedQueue.nome}</h3>
              <QueueComponent
                queueId={selectedQueue.id}
                establishmentId={id}
                onJoinSuccess={handleJoinSuccess}
                onError={handleError}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DetEstabelecimentos;
