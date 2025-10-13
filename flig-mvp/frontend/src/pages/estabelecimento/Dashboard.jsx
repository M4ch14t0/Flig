import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2, FiUsers, FiClock, FiTrendingUp, FiHome, FiList, FiCreditCard, FiDollarSign, FiActivity, FiDownload, FiUserCheck } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/authContextImports.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import styles from './Dashboard.module.css';

const sidebarLinks = [
  { to: '/estabelecimento/home', label: 'Home', icon: <FiHome /> },
  { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <FiBarChart2 />, active: true },
  { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <FiList /> },
  { to: '/estabelecimento/planos', label: 'Planos', icon: <FiCreditCard /> },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showClientCalled } = useNotification();
  // Estados para dados do dashboard
  const [dashboardData, setDashboardData] = useState({
    totalAtendimentos: 0,
    tempoMedioEspera: 0,
    totalAvanços: 0,
    receitaTotal: 0,
    filasAtivas: 0,
    filasEncerradas: 0,
    totalFilas: 0,
    clientesEmFila: 0,
    abandonoRate: 0
  });
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempoEsperaStats, setTempoEsperaStats] = useState({});
  const [atendimentosPorHora, setAtendimentosPorHora] = useState([]);
  const [tempoMedioEspera, setTempoMedioEspera] = useState([]);
  const [dadosRadial, setDadosRadial] = useState([]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verifica se o usuário está logado
      if (!user || !user.id) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando dados do dashboard para estabelecimento:', user.id);

      // Busca estatísticas do estabelecimento
      const statsResponse = await api.get(`/api/estabelecimentos/${user.id}/estatisticas`);
      console.log('📊 Stats response:', statsResponse.data);

      if (statsResponse.data && statsResponse.data.success) {
        const stats = statsResponse.data.data;
        setDashboardData({
          totalAtendimentos: parseInt(stats.totalClientesAtendidos) || 0,
          tempoMedioEspera: Math.round(parseFloat(stats.tempoMedioReal) || 0),
          totalAvanços: parseInt(stats.totalClientesAtendidos) || 0,
          receitaTotal: parseFloat(stats.receitaTotal) || 0,
          filasAtivas: parseInt(stats.filasAtivas) || 0,
          filasEncerradas: parseInt(stats.totalFilas) - parseInt(stats.filasAtivas) || 0,
          totalFilas: parseInt(stats.totalFilas) || 0,
          clientesEmFila: 0, // Será calculado das filas
          abandonoRate: parseFloat(stats.taxa_abandono) || 0 // Taxa real calculada pelo backend
        });
      }

      // Busca filas do estabelecimento
      const filasResponse = await api.get(`/api/queues/establishment/${user.id}`);
      console.log('📋 Filas response:', filasResponse.data);

      if (filasResponse.data.success && Array.isArray(filasResponse.data.data)) {
        const filasData = filasResponse.data.data;
        setFilas(filasData);

        // Calcula clientes em fila total e tempo médio estimado
        let totalClientesEmFila = 0;
        let somaTemposEstimados = 0;
        let filasComTempo = 0;
        
        filasData.forEach(fila => {
          if (fila.stats && fila.stats.totalClients) {
            totalClientesEmFila += fila.stats.totalClients;
          }
          if (fila.tempo_estimado && fila.tempo_estimado > 0) {
            somaTemposEstimados += parseFloat(fila.tempo_estimado);
            filasComTempo++;
          }
        });

        // Calcula tempo médio baseado nos valores estimados das filas
        const tempoMedioEstimado = filasComTempo > 0 ? Math.round(somaTemposEstimados / filasComTempo) : 0;

        // Atualiza clientes em fila e tempo médio
        setDashboardData(prev => ({
          ...prev,
          clientesEmFila: totalClientesEmFila,
          tempoMedioEspera: tempoMedioEstimado
        }));

        // Busca estatísticas de tempo de espera para cada fila
        const tempoStats = {};
        for (const fila of filasData) {
          try {
            const tempoResponse = await api.get(`/api/queues/${fila.id}/tempo-espera?t=${Date.now()}`);
            if (tempoResponse.data.success) {
              console.log(`📊 Dados de tempo para fila ${fila.id}:`, tempoResponse.data.data);
              tempoStats[fila.id] = tempoResponse.data.data.tempoEspera;
            }
          } catch (tempoErr) {
            console.warn(`Erro ao buscar estatísticas de tempo para fila ${fila.id}:`, tempoErr);
          }
        }
        setTempoEsperaStats(tempoStats);

        // Busca dados históricos de atendimentos por hora
        try {
          const atendimentosResponse = await api.get(`/api/estabelecimentos/${user.id}/atendimentos-por-hora`);
          console.log('📊 Atendimentos por hora response:', atendimentosResponse.data);
          
          if (atendimentosResponse.data.success && Array.isArray(atendimentosResponse.data.data)) {
            setAtendimentosPorHora(atendimentosResponse.data.data);
          }
        } catch (error) {
          console.warn('⚠️ Erro ao buscar atendimentos por hora:', error);
          // Usa dados simulados se a API falhar
          prepareChartData(filasData);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Função para preparar dados dos gráficos
  const prepareChartData = (filasData) => {
    // Dados para gráfico de tempo médio de espera por fila
    const tempoEsperaData = filasData.map(fila => ({
      fila: fila.nome || `Fila ${fila.id}`,
      tempo: Math.round(fila.tempo_estimado || 0)
    }));
    setTempoMedioEspera(tempoEsperaData);

    // Dados para gráfico radial - mais realistas
    const totalAtendidos = dashboardData.totalAtendimentos;
    const totalEmFila = dashboardData.clientesEmFila;
    const abandonos = Math.round(totalAtendidos * (dashboardData.abandonoRate / 100));
    const avancos = Math.round(totalAtendidos * 0.05); // 5% de avanços (mais realista)

    // Só mostra categorias com valores > 0
    const radialData = [];
    
    if (totalAtendidos > 0) {
      radialData.push({ name: 'Atendidos', value: totalAtendidos, color: '#4CAF50' });
    }
    if (totalEmFila > 0) {
      radialData.push({ name: 'Em Espera', value: totalEmFila, color: '#2196F3' });
    }
    if (abandonos > 0) {
      radialData.push({ name: 'Abandonos', value: abandonos, color: '#FF9800' });
    }
    if (avancos > 0) {
      radialData.push({ name: 'Avanços', value: avancos, color: '#9C27B0' });
    }

    // Se não há dados, mostra uma mensagem
    if (radialData.length === 0) {
      radialData.push({ name: 'Sem Dados', value: 1, color: '#E0E0E0' });
    }

    setDadosRadial(radialData);
  };

  // Carrega dados quando o componente monta
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Atualiza gráficos quando dados das filas mudarem
  useEffect(() => {
    if (filas.length > 0) {
      prepareChartData(filas);
    }
  }, [filas, dashboardData.totalAtendimentos, dashboardData.clientesEmFila]);

  // Função para ver detalhes da fila
  const handleVerDetalhes = (filaId) => {
    navigate(`/estabelecimento/gerenciar-filas/${filaId}`);
  };

  // Função para gerenciar fila
  const handleGerenciar = () => {
    navigate('/estabelecimento/gerenciar-filas');
  };

  // Função para chamar próximo cliente
  const handleChamarProximo = async (filaId) => {
    try {
      const response = await api.post(`/api/queues/${filaId}/chamar-proximo`);
      
      if (response.data.success) {
        const cliente = response.data.data;
        showClientCalled(cliente.nome);
        // Atualiza os dados do dashboard
        fetchDashboardData();
      } else {
        console.warn('Não há clientes na fila ou erro ao chamar próximo');
      }
    } catch (error) {
      console.error('Erro ao chamar próximo:', error);
    }
  };

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
            {/* Header com título e botão exportar */}
            <div className={styles.dashboardHeader}>
              <h1 className={styles.dashboardTitle}>Dashboard de Gerenciamento</h1>
              <button className={styles.exportButton}>
                <FiDownload size={16} />
                Exportar
              </button>
            </div>

            {/* Cards de Estatísticas Principais */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{dashboardData.clientesEmFila}</div>
                <div className={styles.statLabel}>Pessoas em filas</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statValue}>{dashboardData.tempoMedioEspera} min</div>
                <div className={styles.statLabel}>Tempo Médio de Espera</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statValue}>{dashboardData.totalAtendimentos.toLocaleString()}</div>
                <div className={styles.statLabel}>Atendimentos Realizados</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statValue}>R$ {dashboardData.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <div className={styles.statLabel}>Receita Gerada</div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className={styles.quickActions}>
              <h3 className={styles.quickActionsTitle}>Ações Rápidas</h3>
              <div className={styles.quickActionsGrid}>
                {filas.map(fila => (
                  <div key={fila.id} className={styles.quickActionCard}>
                    <div className={styles.quickActionInfo}>
                      <h4 className={styles.quickActionName}>{fila.nome}</h4>
                      <p className={styles.quickActionStatus}>
                        Status: <span className={styles.statusActive}>{fila.status}</span>
                      </p>
                      <p className={styles.quickActionClients}>
                        Clientes: {fila.stats?.totalClients || 0}
                      </p>
                      {tempoEsperaStats[fila.id] && (
                        <p className={styles.quickActionTempo}>
                          <FiClock size={12} />
                          Tempo médio: {tempoEsperaStats[fila.id].fila?.tempoMedio > 0 
                            ? `${Math.round(tempoEsperaStats[fila.id].fila.tempoMedio)} min`
                            : 'Sem dados'
                          }
                        </p>
                      )}
                    </div>
                    <div className={styles.quickActionButtons}>
                      <button 
                        onClick={() => handleChamarProximo(fila.id)}
                        className={styles.callButton}
                        disabled={!fila.stats?.totalClients || fila.stats.totalClients === 0}
                      >
                        <FiUserCheck size={16} />
                        Chamar Próximo
                      </button>
                      <button 
                        onClick={() => handleVerDetalhes(fila.id)}
                        className={styles.detailsButton}
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráficos */}
            <div className={styles.chartsGrid}>
              {/* Gráfico de Atendimentos por Hora */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Atendimentos por Hora</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={atendimentosPorHora}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hora" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="pessoas" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Tempo Médio de Espera */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Tempo Médio de Espera</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tempoMedioEspera}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fila" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tempo" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico Radial */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Distribuição de Atendimentos</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dadosRadial}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {dadosRadial.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => `Categoria: ${label}`}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: entry.color, fontSize: '12px' }}>
                            {value}: {entry.payload.value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </Layout>
  );
}
