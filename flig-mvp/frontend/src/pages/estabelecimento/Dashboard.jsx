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
  const [chartLoading, setChartLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cores que se adaptam ao tema
  const getChartColors = () => {
    return ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  };

  // Função para gerar dados de fallback
  const generateFallbackData = () => {
    const horas = ['08:00', '12:00', '16:00', '20:00', '00:00'];
    const dadosSimulados = horas.map(hora => ({
      hora,
      pessoas: hora === '08:00' ? 50 : hora === '12:00' ? 120 : hora === '16:00' ? 80 : hora === '20:00' ? 220 : 30
    }));
    setAtendimentosPorHora(dadosSimulados);
  };

  // Função para buscar dados do dashboard
  const fetchDashboardData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Verifica se o usuário está logado
      if (!user || !user.id) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando dados do dashboard para estabelecimento:', user.id);

      // Busca estatísticas do estabelecimento
      const statsResponse = await api.get(`/api/establishments/stats`);
      console.log('📊 Stats data:', statsResponse.data);

      if (statsResponse.data && statsResponse.data.success) {
        const stats = statsResponse.data.data;
        const dashboardData = {
          totalAtendimentos: parseInt(stats.totalClientesAtendidos) || 0,
          tempoMedioEspera: Math.round(parseFloat(stats.tempoMedioReal) || parseFloat(stats.tempoMedioEstimado) || 0),
          totalAvanços: parseInt(stats.totalClientesAtendidos) || 0,
          receitaTotal: parseFloat(stats.receitaTotal) || 0,
          filasAtivas: parseInt(stats.filasAtivas) || 0,
          filasEncerradas: parseInt(stats.totalFilas) - parseInt(stats.filasAtivas) || 0,
          totalFilas: parseInt(stats.totalFilas) || 0,
          clientesEmFila: 0, // Será calculado das filas
          abandonoRate: stats.totalAbandonos > 0 ? (stats.totalAbandonos / (stats.totalClientesAtendidos + stats.totalAbandonos)) * 100 : 0
        };
        
        console.log('📊 Dashboard atualizado:', dashboardData);
        setDashboardData(dashboardData);
      } else {
        console.warn('⚠️ Stats response não foi bem-sucedida:', statsResponse.data);
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
        setChartLoading(true);
        try {
          const atendimentosResponse = await api.get(`/api/establishments/${user.id}/atendimentos-por-hora`);
          console.log('📊 Atendimentos por hora response:', atendimentosResponse.data);
          
          if (atendimentosResponse.data.success && Array.isArray(atendimentosResponse.data.data)) {
            // Formatar dados para o gráfico
            const dadosFormatados = atendimentosResponse.data.data.map(item => ({
              hora: `${item.hora.toString().padStart(2, '0')}:00`,
              pessoas: item.total_atendimentos || 0
            }));
            setAtendimentosPorHora(dadosFormatados);
          } else {
            // Dados de fallback se não houver dados reais
            generateFallbackData();
          }
        } catch (error) {
          console.warn('⚠️ Erro ao buscar atendimentos por hora:', error);
          // Usa dados simulados se a API falhar
          generateFallbackData();
        } finally {
          setChartLoading(false);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Função para preparar dados dos gráficos
  const prepareChartData = (filasData) => {
    // Dados para gráfico de tempo médio de espera por fila
    const tempoEsperaData = [
      { fila: "FilaA", tempo: 25 },
      { fila: "FilaB", tempo: 12 },
      { fila: "FilaC", tempo: 9 }
    ];
    setTempoMedioEspera(tempoEsperaData);

    // Dados para gráfico radial - como na imagem
    const radialData = [
      { name: "Atendidos", value: 8, color: "#8b5cf6" },
      { name: "Em Espera", value: 8, color: "#06b6d4" },
      { name: "Abandonos", value: 1, color: "#10b981" }
    ];
    
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
  }, [filas]);

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
      console.log('📞 Chamando próximo cliente da fila:', filaId);
      const response = await api.post(`/api/queues/${filaId}/chamar-proximo`);
      console.log('📞 Resposta da chamada:', response.data);
      
      if (response.data.success) {
        const cliente = response.data.data;
        showClientCalled(cliente.nome);
        
        // Atualiza os dados do dashboard após chamar cliente
        console.log('🔄 Atualizando dashboard após chamar cliente...');
        setTimeout(() => {
          fetchDashboardData(true);
        }, 1000);
        
      } else {
        console.warn('Não há clientes na fila ou erro ao chamar próximo:', response.data.message);
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
              <div className={styles.titleSection}>
                <h1 className={styles.dashboardTitle}>Dashboard de Gerenciamento</h1>
                {isRefreshing && (
                  <div className={styles.refreshIndicator}>
                    <div className={styles.loader}></div>
                    <span>Atualizando...</span>
                  </div>
                )}
              </div>
              <button className={styles.exportButton}>
                <FiDownload size={16} />
                Exportar
              </button>
            </div>

            {/* Layout Principal */}
            <div className={styles.mainLayout}>
              {/* Cards de Estatísticas Principais */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>767</div>
                  <div className={styles.statLabel}>Pessoas em filas</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statValue}>13,7%</div>
                  <div className={styles.statLabel}>Abandono de Filas</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statValue}>11.000</div>
                  <div className={styles.statLabel}>Atendimentos Realizados</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statValue}>R$:15.600</div>
                  <div className={styles.statLabel}>Receita Gerada</div>
                </div>
              </div>

              {/* Gráficos */}
              <div className={styles.chartsGrid}>
              {/* Gráfico de Atendimentos por Hora */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Atendimentos por Hora</h3>
                <div className={styles.chartContainer}>
                  {chartLoading ? (
                    <div className={styles.chartLoading}>
                      <div className={styles.loader}></div>
                      <p>Carregando dados...</p>
                    </div>
                  ) : atendimentosPorHora.length === 0 ? (
                    <div className={styles.emptyChart}>
                      <p>Nenhum dado de atendimento disponível</p>
                      <small>Os dados aparecerão conforme os atendimentos forem registrados</small>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={atendimentosPorHora}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#555555"
                          opacity={0.3}
                        />
                        <XAxis 
                          dataKey="hora" 
                          tick={{ fill: '#ffffff', fontSize: 12 }}
                          axisLine={{ stroke: '#555555' }}
                          tickLine={{ stroke: '#555555' }}
                        />
                        <YAxis 
                          tick={{ fill: '#ffffff', fontSize: 12 }}
                          axisLine={{ stroke: '#555555' }}
                          tickLine={{ stroke: '#555555' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#333333',
                            border: '1px solid #555555',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                          labelStyle={{ color: '#ffffff' }}
                          formatter={(value, name) => [value, 'Pessoas Atendidas']}
                          labelFormatter={(label) => `Hora: ${label}`}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          formatter={(value, entry) => (
                            <span style={{ 
                              color: '#ffffff', 
                              fontSize: '12px' 
                            }}>
                              Pessoas Atendidas
                            </span>
                          )}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pessoas" 
                          stroke={getChartColors()[0]}
                          strokeWidth={3}
                          fill={getChartColors()[0]}
                          fillOpacity={0.3}
                          name="Pessoas Atendidas"
                          dot={{ fill: getChartColors()[0], strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: getChartColors()[0], strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Gráfico de Tempo Médio de Espera */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Tempo Médio de Espera</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tempoMedioEspera}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#555555"
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="fila" 
                        tick={{ fill: '#ffffff', fontSize: 12 }}
                        axisLine={{ stroke: '#555555' }}
                        tickLine={{ stroke: '#555555' }}
                      />
                      <YAxis 
                        tick={{ fill: '#ffffff', fontSize: 12 }}
                        axisLine={{ stroke: '#555555' }}
                        tickLine={{ stroke: '#555555' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#333333',
                          border: '1px solid #555555',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Bar 
                        dataKey="tempo" 
                        fill={getChartColors()[1]}
                        radius={[4, 4, 0, 0]}
                      />
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => `Categoria: ${label}`}
                        contentStyle={{
                          backgroundColor: '#333333',
                          border: '1px solid #555555',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ 
                            color: '#ffffff', 
                            fontSize: '12px' 
                          }}>
                            {value}: {entry.payload.value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            </div>

          </>
        )}
      </div>
    </Layout>
  );
}
