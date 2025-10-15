import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Clock, Users, MapPin, ArrowLeft, Phone, Home, List } from 'lucide-react';
import Layout from '../../../components/Layout';
import { api } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/authContextImports';
import styles from './DetEstabelecimentos.module.css';

function DetEstabelecimentos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, userType } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [establishment, setEstablishment] = useState(null);
  const [filas, setFilas] = useState([]);

  useEffect(() => {
    if (id) {
      loadEstablishmentData();
    }
  }, [id]);

  const loadEstablishmentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/establishments/${id}`);
      
      if (response.data.success) {
        setEstablishment(response.data.data);
        setFilas(response.data.data.filas || []);
      } else {
        setError('Erro ao carregar dados do estabelecimento');
      }
    } catch (err) {
      console.error('Erro ao carregar estabelecimento:', err);
      setError('Erro ao carregar dados do estabelecimento');
    } finally {
      setLoading(false);
    }
  };

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
      const clientData = {
        nome: user.name || user.nome || '',
        telefone: user.telefone || user.phone || '(11) 99999-9999',
        email: user.email || user.email_usuario || ''
      };

      console.log('🔍 Dados do usuário:', user);
      console.log('🔍 Dados sendo enviados:', clientData);

      if (!clientData.nome || !clientData.email) {
        alert('Dados essenciais do usuário incompletos. Verifique seu perfil.');
        return;
      }

      const response = await api.post(`/api/queues/${fila.id}/join`, clientData);

      if (response.data.success) {
        alert('Você entrou na fila com sucesso!');
        await loadEstablishmentData();
        navigate('/cliente/minhas-filas');
      } else {
        alert(`Erro: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
      alert(error.response?.data?.message || 'Erro ao entrar na fila');
    }
  };

  const sidebarLinks = [
    { path: '/cliente', icon: Home, label: 'Início' },
    { path: '/cliente/estabelecimentos', icon: List, label: 'Estabelecimentos' },
    { path: '/cliente/minhas-filas', icon: Users, label: 'Minhas Filas' },
    { path: '/cliente/conta', icon: Phone, label: 'Conta' }
  ];

  if (loading) {
    return (
      <Layout sidebarLinks={sidebarLinks}>
        <div className={styles.loading}>
          <Loader2 size={32} className="animate-spin" />
          <p>Carregando estabelecimento...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout sidebarLinks={sidebarLinks}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => navigate('/cliente/estabelecimentos')}>
            Voltar aos Estabelecimentos
          </button>
        </div>
      </Layout>
    );
  }

  if (!establishment) {
    return (
      <Layout sidebarLinks={sidebarLinks}>
        <div className={styles.error}>
          <p>Estabelecimento não encontrado</p>
          <button onClick={() => navigate('/cliente/estabelecimentos')}>
            Voltar aos Estabelecimentos
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarLinks={sidebarLinks}>
      <div className={`${styles.container} ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
        <div className={styles.estabCard}>
          <div className={styles.imageBox}>
            <div className={styles.placeholderImage}>
              <Users size={48} />
              <p>Imagem do Estabelecimento</p>
            </div>
          </div>
          
          <div className={styles.infoBox}>
            <h1 className={styles.estabName}>{establishment.nome_empresa}</h1>
            <p className={styles.estabDescription}>{establishment.descricao}</p>
            
            <div className={styles.addressSection}>
              <MapPin size={16} />
              <span>{establishment.endereco_empresa}, {establishment.numero_empresa}</span>
            </div>
            
            <div className={styles.waitTimeSection}>
              <Clock size={16} />
              <span className={styles.waitTime}>
                Tempo médio de espera: {establishment.tempo_medio_espera || 15} minutos
              </span>
            </div>
          </div>
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
    </Layout>
  );
}

export default DetEstabelecimentos;

