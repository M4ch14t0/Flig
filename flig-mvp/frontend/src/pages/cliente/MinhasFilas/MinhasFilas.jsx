import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowUp, Home, MapPin, List } from 'lucide-react';
import Layout from '../../../components/Layout';
import styles from './MinhasFilas.module.css';
import { api } from '../../../services/api';

function MinhasFilas() {
  const navigate = useNavigate();
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

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
  ]; // Email do usuário logado

  // Buscar filas do usuário
  useEffect(() => {
    // Obter email do usuário do localStorage ou contexto de autenticação
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
    fetchUserQueues();
  }, []);

  const fetchUserQueues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar a API correta para buscar filas ativas do usuário
      const response = await api.get('/users/active-queues');
      const data = response.data;
      
      if (data.success) {
        // Transformar os dados para o formato esperado pelo frontend
        const userQueues = data.data.map(fila => ({
          id: fila.queue_id,
          nome: fila.fila_nome,
          tempo_estimado: fila.tempo_estimado,
          valor_avancos: fila.valor_avancos,
          estabelecimento_nome: fila.estabelecimento_nome,
          endereco_empresa: fila.endereco_empresa,
          telefone_empresa: fila.telefone_empresa,
          userPosition: fila.posicao_atual,
          totalClients: fila.total_pessoas_fila || 0,
          status: fila.status,
          data_entrada: fila.data_entrada
        }));
        
        setFilas(userQueues);
      } else {
        setError('Erro ao carregar suas filas');
      }
    } catch (err) {
      setError('Erro ao carregar suas filas');
      console.error('Erro ao buscar filas do usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancePosition = async (queueId, currentPosition) => {
    try {
      // Primeiro, buscar o clientId do usuário na fila
      const clientsResponse = await api.get(`/queues/${queueId}/clients`);
      const clientsData = clientsResponse.data;
      
      if (!clientsData.success) {
        alert('Erro ao buscar dados da fila');
        return;
      }
      
      const userInQueue = clientsData.data.clients.find(client => 
        client.email === userEmail
      );
      
      if (!userInQueue) {
        alert('Usuário não encontrado na fila');
        return;
      }
      
      const response = await api.post(`/queues/${queueId}/advance`, {
        clientId: userInQueue.id,
        positions: 1, // Avançar 1 posição
        paymentData: {
          paymentMethod: 'credit_card',
          amount: parseFloat(filas.find(f => f.id === queueId)?.valor_avancos || 0)
        }
      });

      if (response.data.success) {
        alert(`Posição avançada! Nova posição: ${response.data.data.newPosition}`);
        fetchUserQueues(); // Atualizar lista
      } else {
        alert(`Erro: ${response.data.message}`);
      }
    } catch (err) {
      console.error('Erro ao avançar posição:', err);
      alert('Erro ao avançar posição');
    }
  };

  const handleLeaveQueue = async (queueId, queueName) => {
    if (!confirm(`Tem certeza que deseja sair da fila "${queueName}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/queues/${queueId}/leave`);

      if (response.data.success) {
        alert(`Você saiu da fila "${queueName}" com sucesso!`);
        fetchUserQueues(); // Atualizar lista
      } else {
        alert(`Erro: ${response.data.message}`);
      }
    } catch (err) {
      console.error('Erro ao sair da fila:', err);
      alert('Erro ao sair da fila');
    }
  };
  return (
    <Layout
      sidebarLinks={sidebarLinks}
      userType="cliente"
      showFooter={false}
    >
      <div className={styles.container}>
        <h2 className={styles.pageTitle}>Minhas Filas</h2>

        {loading && <div className={styles.loading}>Carregando suas filas...</div>}
        {error && <div className={styles.error}>{error}</div>}
        
        {!loading && !error && (
          <div className={styles.filasLista}>
            {filas.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Você não está em nenhuma fila no momento.</p>
                <Link to="/cliente/estabelecimentos" className={styles.exploreBtn}>
                  Explorar Estabelecimentos
                </Link>
              </div>
            ) : (
              filas.map((fila) => (
                <div key={fila.id} className={styles.filaCard}>
                  <div className={styles.cardImage}></div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardTop}>
                      <h3>{fila.estabelecimento_nome || 'Estabelecimento'}</h3>
                      <button 
                        className={styles.sairBtn}
                        onClick={() => handleLeaveQueue(fila.id, fila.fila_nome)}
                      >
                        Sair <span>⏏</span>
                      </button>
                    </div>
                    <p><strong>{fila.fila_nome}</strong> - {fila.total_pessoas_fila} pessoas</p>
                    <p><strong>Posição</strong> - {fila.posicao_atual}º</p>
                    
                    <div className={styles.queueInfo}>
                      <div className={styles.infoItem}>
                        <Clock size={16} />
                        <span>Tempo estimado: {Number(fila.tempo_estimado || 0)}min</span>
                      </div>
                      <div className={styles.infoItem}>
                        <Users size={16} />
                        <span>{fila.total_pessoas_fila} pessoas na fila</span>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button 
                        className={styles.avanBtn}
                        onClick={() => handleAdvancePosition(fila.id, fila.posicao_atual)}
                      >
                        <ArrowUp size={16} />
                        Avançar Posição (R$ {parseFloat(fila.valor_avancos || 0).toFixed(2)})
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MinhasFilas;
