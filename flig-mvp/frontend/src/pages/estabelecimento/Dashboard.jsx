import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiUsers, FiClock, FiTrendingUp, FiHome, FiList, FiCreditCard, FiDollarSign, FiActivity } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/authContextImports.js';
import styles from './Dashboard.module.css';

const sidebarLinks = [
  { to: '/estabelecimento/home', label: 'Home', icon: <FiHome /> },
  { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <FiBarChart2 />, active: true },
  { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <FiList /> },
  { to: '/estabelecimento/planos', label: 'Planos', icon: <FiCreditCard /> },
];

export default function Dashboard() {
  const { user } = useAuth();
  // Estados para dados do dashboard
  const [dashboardData, setDashboardData] = useState({
    totalAtendimentos: 0,
    tempoMedioEspera: 0,
    totalAvanços: 0,
    receitaTotal: 0,
    filasAtivas: 0,
    clientesEmFila: 0
  });
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Busca estatísticas do estabelecimento
      const statsResponse = await api.get('/establishments/stats');
      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        setDashboardData({
          totalAtendimentos: stats.totalClientesAtendidos || 0,
          tempoMedioEspera: Math.round(stats.tempoMedioEstimado || 0),
          totalAvanços: stats.totalClientesUnicos || 0,
          receitaTotal: stats.receitaTotal || 0,
          filasAtivas: stats.filasAtivas || 0,
          clientesEmFila: stats.totalClientesAtendidos || 0
        });
      }

      // Busca filas do estabelecimento
      const filasResponse = await api.get('/establishments/queues');
      if (filasResponse.data.success) {
        setFilas(filasResponse.data.data);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados quando o componente monta
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento">
      <div className={styles.dashboardContainer}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Carregando dados do dashboard...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className={styles.retryButton}>
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiUsers size={32} />
                </div>
                <div className={styles.statContent}>
                  <h3>Total de Atendimentos</h3>
                  <p className={styles.statValue}>{dashboardData.totalAtendimentos}</p>
                  <small>Clientes atendidos hoje</small>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiClock size={32} />
                </div>
                <div className={styles.statContent}>
                  <h3>Tempo Médio de Espera</h3>
                  <p className={styles.statValue}>{dashboardData.tempoMedioEspera} min</p>
                  <small>Por cliente</small>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiTrendingUp size={32} />
                </div>
                <div className={styles.statContent}>
                  <h3>Avanços Pagos</h3>
                  <p className={styles.statValue}>{dashboardData.totalAvanços}</p>
                  <small>Posições avançadas</small>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiDollarSign size={32} />
                </div>
                <div className={styles.statContent}>
                  <h3>Receita Total</h3>
                  <p className={styles.statValue}>R$ {Number(dashboardData.receitaTotal || 0).toFixed(2)}</p>
                  <small>De avanços pagos</small>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiActivity size={32} />
                </div>
                <div className={styles.statContent}>
                  <h3>Filas Ativas</h3>
                  <p className={styles.statValue}>{dashboardData.filasAtivas}</p>
                  <small>Em funcionamento</small>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiUsers size={32} />
                </div>
                <div className={styles.statContent}>
                  <h3>Clientes em Fila</h3>
                  <p className={styles.statValue}>{dashboardData.clientesEmFila}</p>
                  <small>Aguardando atendimento</small>
                </div>
              </div>
            </div>

            {/* Seção de Filas */}
            <div className={styles.filasSection}>
              <h2>Suas Filas</h2>
              {filas.length === 0 ? (
                <div className={styles.noQueues}>
                  <p>Nenhuma fila encontrada.</p>
                  <button className={styles.createQueueButton}>
                    Criar Primeira Fila
                  </button>
                </div>
              ) : (
                <div className={styles.filasGrid}>
                  {filas.map((fila) => (
                    <div key={fila.id} className={styles.filaCard}>
                      <div className={styles.filaHeader}>
                        <h3>{fila.nome}</h3>
                        <span className={`${styles.status} ${fila.status === 'ativa' ? styles.active : styles.inactive}`}>
                          {fila.status === 'ativa' ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <div className={styles.filaStats}>
                        <div className={styles.filaStat}>
                          <span className={styles.filaStatLabel}>Clientes:</span>
                          <span className={styles.filaStatValue}>{fila.stats?.totalClients || 0}</span>
                        </div>
                        <div className={styles.filaStat}>
                          <span className={styles.filaStatLabel}>Tempo médio:</span>
                          <span className={styles.filaStatValue}>{fila.stats?.averageWaitTime || 0}min</span>
                        </div>
                        <div className={styles.filaStat}>
                          <span className={styles.filaStatLabel}>Receita:</span>
                          <span className={styles.filaStatValue}>R$ {Number(fila.stats?.totalRevenue || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className={styles.filaActions}>
                        <button className={styles.viewButton}>Ver Detalhes</button>
                        <button className={styles.manageButton}>Gerenciar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seção de Relatórios */}
            <div className={styles.reportsSection}>
              <h2>Relatórios e Gráficos</h2>
              <div className={styles.reportsPlaceholder}>
                <p>📊 Gráficos de atendimentos, abandonos e avanços pagos em breve!</p>
                <p>Esta seção mostrará:</p>
                <ul>
                  <li>Gráfico de atendimentos por hora</li>
                  <li>Taxa de abandono de filas</li>
                  <li>Receita por fila</li>
                  <li>Tempo médio de espera por período</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
