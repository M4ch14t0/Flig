import React, { useState, useEffect } from 'react';
import { FiUsers, FiClock, FiArrowUpCircle, FiChevronLeft } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard, Users, Clock, DollarSign } from 'lucide-react';
import styles from './DetalhesFila.module.css';

export default function DetalhesFila() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fila, setFila] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const filaResponse = await fetch(`http://localhost:5000/api/queues/${id}`);
      if (filaResponse.ok) {
        const filaData = await filaResponse.json();
        if (filaData.success) {
          setFila(filaData.data);
        }
      }

      // Buscar clientes da fila
      const clientsResponse = await fetch(`http://localhost:5000/api/queues/${id}/clients`);
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        if (clientsData.success) {
          setClients(clientsData.data.clients || []);
        }
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

  const calculateWaitTime = (position, tempoEstimado) => {
    return (position - 1) * tempoEstimado;
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
        
        <h1 className={styles.title}>
          <FiUsers /> {fila?.nome || 'Detalhes da Fila'}
        </h1>

        {fila && (
          <div className={styles.cards}>
            <div className={styles.card}>
              <Users size={28} />
              <h2>Total de Clientes</h2>
              <p>{clients.length}</p>
            </div>
            <div className={styles.card}>
              <Clock size={28} />
              <h2>Tempo Estimado</h2>
              <p>{Number(fila.tempo_estimado || 0)} min/posição</p>
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
          </div>
        )}

        <div className={styles.main}>
          <h2>Clientes na Fila</h2>
          
          {clients.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhum cliente na fila no momento.</p>
            </div>
          ) : (
            <div className={styles.clientsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Tempo de Espera</th>
                    <th>Entrou em</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr key={client.id || index}>
                      <td className={styles.position}>
                        <span className={styles.positionBadge}>
                          {client.position}
                        </span>
                      </td>
                      <td className={styles.name}>{client.nome}</td>
                      <td className={styles.email}>{client.email}</td>
                      <td className={styles.phone}>{client.telefone}</td>
                      <td className={styles.waitTime}>
                        {calculateWaitTime(client.position, Number(fila?.tempo_estimado || 5))} min
                      </td>
                      <td className={styles.timestamp}>
                        {formatTimestamp(client.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
