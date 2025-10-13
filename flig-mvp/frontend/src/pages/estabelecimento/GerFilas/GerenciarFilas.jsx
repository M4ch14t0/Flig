import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard, Loader2, Users, Clock, DollarSign, Search, ChevronRight } from 'lucide-react';
import styles from './GerFilas.module.css';
import { api } from '../../../services/api';
import { AuthContext } from '../../../contexts/authContextImports';

function GerenciarFilas() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [popupVisible, setPopupVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filaEditando, setFilaEditando] = useState(null);
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempoEsperaStats, setTempoEsperaStats] = useState({});
  const [novaFila, setNovaFila] = useState({
    nome: '',
    tipo_fila: 'preferencial',
    limitar_fila: false,
    max_integrantes: 0,
    abrir_agora: true,
    horario_abertura: '00:00',
    chamada_automatica: false,
    intervalo_chamada: 5, // minutos
  });

  // ID do estabelecimento (obtido do contexto de autenticação)
  const estabelecimentoId = user?.id || 8; // Fallback para teste

  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} />, active: true },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} /> },
  ];

  // Função para buscar filas do estabelecimento
  const fetchFilas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verifica se o usuário está logado e é um estabelecimento
      if (!user || !user.id) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
      
      if (user.type !== 'estabelecimento') {
        setError('Acesso negado. Apenas estabelecimentos podem gerenciar filas.');
        setLoading(false);
        return;
      }
      
      const response = await api.get(`/api/queues/establishment/${user.id}`);
      const data = response.data;
      setFilas(data.success && Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Erro ao buscar filas:', error);
      setError('Erro ao carregar filas');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar estatísticas de tempo de espera
  const fetchTempoEsperaStats = async (filaId) => {
    try {
      const response = await api.get(`/api/queues/${filaId}/tempo-espera`);
      if (response.data.success) {
        setTempoEsperaStats(prev => ({
          ...prev,
          [filaId]: response.data.data.tempoEspera
        }));
      }
    } catch (error) {
      console.warn('Erro ao buscar estatísticas de tempo de espera:', error);
      // Não falhar a operação por causa das estatísticas
    }
  };

  // Carrega filas quando o componente monta
  useEffect(() => {
    fetchFilas();
  }, []);

  // Busca estatísticas de tempo de espera quando as filas são carregadas
  useEffect(() => {
    if (filas.length > 0) {
      filas.forEach(fila => {
        fetchTempoEsperaStats(fila.id);
      });
    }
  }, [filas]);

  const handleCriarFila = async () => {
    try {
      console.log('Dados da nova fila:', novaFila);
      console.log('Estabelecimento ID:', estabelecimentoId);
      console.log('User context:', user);
      
      // Validação básica
      if (!novaFila.nome.trim()) {
        alert('Nome da fila é obrigatório');
        return;
      }
      
      if (novaFila.limitar_fila && (!novaFila.max_integrantes || novaFila.max_integrantes <= 0)) {
        alert('Máximo de integrantes deve ser maior que zero quando a fila é limitada');
        return;
      }
      
      const payload = {
        ...novaFila,
        estabelecimento_id: estabelecimentoId
      };
      
      console.log('Payload sendo enviado:', payload);
      
      let response;
      if (editMode && filaEditando) {
        // Modo de edição
        response = await api.put(`/api/queues/${filaEditando.id}`, payload);
        if (response.data.success) {
          alert('Fila atualizada com sucesso!');
        } else {
          alert('Erro ao atualizar fila: ' + (response.data.message || 'Erro desconhecido'));
          return;
        }
      } else {
        // Modo de criação
        response = await api.post('/api/queues', payload);
        if (response.data.success) {
          alert('Fila criada com sucesso!');
        } else {
          alert('Erro ao criar fila: ' + (response.data.message || 'Erro desconhecido'));
          return;
        }
      }

      // Atualiza a lista de filas
      fetchFilas();
      setPopupVisible(false);
      setEditMode(false);
      setFilaEditando(null);
      setNovaFila({
        nome: '',
        tipo_fila: 'preferencial',
        limitar_fila: false,
        max_integrantes: 0,
        abrir_agora: true,
        horario_abertura: '00:00',
        chamada_automatica: false,
        intervalo_chamada: 5,
      });
    } catch (error) {
      console.error('Erro ao criar/editar fila:', error);
      alert('Erro ao criar/editar fila. Tente novamente.');
    }
  };

  const handleStatusChange = async (filaId, novoStatus) => {
    try {
      const response = await api.put(`/api/queues/${filaId}/status`, { status: novoStatus });

      alert(`Fila ${novoStatus === 'pausada' ? 'pausada' : 'reativada'} com sucesso!`);
      fetchFilas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da fila');
    }
  };

  const handleChamarProximo = async (filaId) => {
    try {
      const response = await api.post(`/api/queues/${filaId}/chamar-proximo`);
      
      if (response.data.success) {
        fetchFilas(); // Atualiza a lista
      }
    } catch (error) {
      console.error('Erro ao chamar próximo:', error);
    }
  };

  const handleEditarFila = (fila) => {
    setFilaEditando(fila);
    setEditMode(true);
    setNovaFila({
      nome: fila.nome,
      descricao: fila.descricao || '',
      max_avancos: fila.max_avancos || 8,
      valor_avancos: fila.valor_avancos || 2.00,
      tempo_estimado: fila.tempo_estimado || 5,
      chamada_automatica: fila.chamada_automatica || false,
      intervalo_chamada: fila.intervalo_chamada || 5,
    });
    setPopupVisible(true);
  };

  const handleEncerrarFila = async (filaId) => {
    if (!confirm('Tem certeza que deseja encerrar esta fila? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/queues/${filaId}`);

      alert('Fila encerrada com sucesso!');
      fetchFilas();
    } catch (error) {
      console.error('Erro ao encerrar fila:', error);
      alert('Erro ao encerrar fila');
    }
  };

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <main className={styles.main}>
        <h2>Gerenciar Filas</h2>
        <div className={styles.barTop}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Pesquisar Filas..." />
          </div>
          <button onClick={() => setPopupVisible(true)}>Criar Filas</button>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.loader} size={32} />
            <p>Carregando filas...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchFilas} className={styles.retryButton}>
              Tentar Novamente
            </button>
          </div>
        ) : filas.length === 0 ? (
          <div className={styles.noQueues}>
            <p>Nenhuma fila encontrada.</p>
            <button onClick={() => setPopupVisible(true)} className={styles.createButton}>
              Criar Primeira Fila
            </button>
          </div>
        ) : (
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Filas</th>
                <th>Status</th>
                <th>Usuários</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.id}>
                  <td>
                    <div className={styles.filaInfo}>
                      <strong>{fila.nome}</strong>
                      <small>{fila.descricao || 'Sem descrição'}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.status} ${fila.status === 'ativa' ? styles.active : fila.status === 'pausada' ? styles.paused : styles.inactive}`}>
                      {fila.status === 'ativa' ? 'Ativa' : fila.status === 'pausada' ? 'Pausada' : 'Inativa'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.clientInfo}>
                      <span className={styles.clientCount}>
                        {fila.stats?.totalClients || 0} usuários
                      </span>
                      {tempoEsperaStats[fila.id] && (
                        <div className={styles.tempoEspera}>
                          <Clock size={12} />
                          <span>
                            {tempoEsperaStats[fila.id].fila?.tempoMedio > 0 
                              ? `${Math.round(tempoEsperaStats[fila.id].fila.tempoMedio)} min médio`
                              : 'Sem dados'
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {fila.status === 'ativa' ? (
                        <button 
                          onClick={() => handleStatusChange(fila.id, 'pausada')}
                          className={styles.pauseButton}
                        >
                          Pausar
                        </button>
                      ) : fila.status === 'pausada' ? (
                        <button 
                          onClick={() => handleStatusChange(fila.id, 'ativa')}
                          className={styles.resumeButton}
                        >
                          Reativar
                        </button>
                      ) : null}
                      
                      {fila.status === 'ativa' && (
                        <button 
                          onClick={() => handleChamarProximo(fila.id)}
                          className={styles.callButton}
                        >
                          Chamada
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleEncerrarFila(fila.id)}
                        className={styles.closeButton}
                      >
                        Encerrar
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/estabelecimento/gerenciar-filas/${fila.id}`)}
                        className={styles.detailsButton}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {popupVisible && (
          <div className={styles.popupOverlay} onClick={() => setPopupVisible(false)}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
              <div className={styles.popupHeader}>
                <h3 className={styles.popupTitle}>Criar Filas</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setPopupVisible(false)}
                >
                  ×
                </button>
              </div>

              <div className={styles.popupContent}>
                  <div className={styles.formGroup}>
                  <label className={styles.label}>Nome da Fila:</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ex: Fila Principal"
                    value={novaFila.nome}
                    onChange={(e) => setNovaFila({ ...novaFila, nome: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Fila:</label>
                <select 
                  className={styles.select}
                  value={novaFila.tipo_fila || 'preferencial'}
                  onChange={(e) => setNovaFila({ ...novaFila, tipo_fila: e.target.value })}
                >
                  <option value="preferencial">Preferencial</option>
                  <option value="normal">Normal</option>
                  <option value="expressa">Expressa</option>
                </select>
              </div>

                <div className={styles.formGroup}>
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="limitar_fila"
                      className={styles.checkbox}
                      checked={novaFila.limitar_fila || false}
                      onChange={(e) => setNovaFila({ ...novaFila, limitar_fila: e.target.checked })}
                    />
                    <label htmlFor="limitar_fila" className={styles.checkboxLabel}>
                      Limitar Fila
                    </label>
                  </div>
                </div>

                {novaFila.limitar_fila && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Máximo de Integrantes:</label>
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="Máx"
                      min="1"
                      value={novaFila.max_integrantes || ''}
                      onChange={(e) => setNovaFila({ ...novaFila, max_integrantes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Horário de Abertura:</label>
                  <div className={styles.radioGroup}>
                    <div className={styles.radioOption}>
                      <input
                        type="radio"
                        id="horario_manual"
                        name="horario_abertura"
                        className={styles.radio}
                        checked={!novaFila.abrir_agora}
                        onChange={() => setNovaFila({ ...novaFila, abrir_agora: false })}
                      />
                      <input
                        type="time"
                        className={styles.timeInput}
                        value={novaFila.horario_abertura || '00:00'}
                        onChange={(e) => setNovaFila({ ...novaFila, horario_abertura: e.target.value })}
                        disabled={novaFila.abrir_agora}
                      />
                    </div>
                    <div className={styles.radioOption}>
                      <input
                        type="radio"
                        id="abrir_agora"
                        name="horario_abertura"
                        className={styles.radio}
                        checked={novaFila.abrir_agora}
                        onChange={() => setNovaFila({ ...novaFila, abrir_agora: true })}
                      />
                      <label htmlFor="abrir_agora" className={styles.radioLabel}>
                        Abrir Agora
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="chamada_automatica"
                      className={styles.checkbox}
                      checked={novaFila.chamada_automatica}
                      onChange={(e) => setNovaFila({ ...novaFila, chamada_automatica: e.target.checked })}
                    />
                    <label htmlFor="chamada_automatica" className={styles.checkboxLabel}>
                      Habilitar chamada automática
                    </label>
                  </div>
                </div>

                {novaFila.chamada_automatica && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Intervalo entre chamadas (minutos):</label>
                    <input
                      type="number"
                      className={styles.input}
                      min="1"
                      max="60"
                      value={novaFila.intervalo_chamada}
                      onChange={(e) => setNovaFila({ ...novaFila, intervalo_chamada: parseInt(e.target.value) })}
                    />
                  </div>
                )}

                <div className={styles.popupActions}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => setPopupVisible(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className={styles.createButton}
                    onClick={handleCriarFila}
                  >
                    {editMode ? 'Atualizar Fila' : 'Criar Fila'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

export default GerenciarFilas;
