import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard, Loader2, Users, Clock, DollarSign } from 'lucide-react';
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
  const [novaFila, setNovaFila] = useState({
    nome: '',
    descricao: '',
    max_avancos: 8,
    valor_avancos: 2.00,
    tempo_estimado: 5,
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

  // Carrega filas quando o componente monta
  useEffect(() => {
    fetchFilas();
  }, []);

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
        descricao: '',
        max_avancos: 8,
        valor_avancos: 2.00,
        tempo_estimado: 5,
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
        const cliente = response.data.data;
        alert(`Próximo cliente: ${cliente.nome} (${cliente.email})`);
        fetchFilas(); // Atualiza a lista
      } else {
        alert('Não há clientes na fila ou erro ao chamar próximo');
      }
    } catch (error) {
      console.error('Erro ao chamar próximo:', error);
      alert('Erro ao chamar próximo cliente');
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
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <h2>Gerenciar Filas</h2>
          <div className={styles.barTop}>
            <input type="text" placeholder="Pesquisar Filas..." />
            <button onClick={() => setPopupVisible(true)}>Criar Fila</button>
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
                  <th>Nome da Fila</th>
                  <th>Status</th>
                  <th>Clientes</th>
                  <th>Tempo Médio</th>
                  <th>Valor Avanço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.id}>
                    <td>
                      <div className={styles.filaInfo}>
                        <strong>{fila.nome}</strong>
                        <small>{fila.descricao}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.status} ${fila.status === 'ativa' ? styles.active : fila.status === 'pausada' ? styles.paused : styles.inactive}`}>
                        {fila.status === 'ativa' ? 'Ativa' : fila.status === 'pausada' ? 'Pausada' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.clientCount}>
                        <Users size={16} /> {fila.stats?.totalClients || 0}
                      </span>
                    </td>
                    <td>
                      <span className={styles.timeEstimate}>
                        <Clock size={16} /> {fila.stats?.averageWaitTime || 0}min
                      </span>
                    </td>
                    <td>
                      <span className={styles.priceInfo}>
                        <DollarSign size={16} /> R$ {parseFloat(fila.valor_avancos || 0).toFixed(2)}
                      </span>
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
                            Chamar Próximo
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleEditarFila(fila)}
                          className={styles.editButton}
                        >
                          Editar
                        </button>
                        
                        <button 
                          onClick={() => navigate(`/estabelecimento/gerenciar-filas/${fila.id}`)}
                          className={styles.detailsButton}
                        >
                          Detalhes
                        </button>
                        
                        <button 
                          onClick={() => handleEncerrarFila(fila.id)}
                          className={styles.closeButton}
                        >
                          Encerrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>

        {popupVisible && (
          <div className={styles.popupOverlay} onClick={() => setPopupVisible(false)}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
              <h3>{editMode ? 'Editar Fila' : 'Criar Fila'}</h3>

              <label>Nome da Fila:</label>
              <input
                placeholder="Ex: Fila Principal"
                value={novaFila.nome}
                onChange={(e) => setNovaFila({ ...novaFila, nome: e.target.value })}
                required
              />

              <label>Descrição:</label>
              <textarea
                placeholder="Descreva a fila..."
                value={novaFila.descricao}
                onChange={(e) => setNovaFila({ ...novaFila, descricao: e.target.value })}
                rows={3}
              />

              <label>Máximo de Avanços por Pagamento:</label>
              <input
                type="number"
                min="1"
                max="8"
                value={novaFila.max_avancos}
                onChange={(e) => setNovaFila({ ...novaFila, max_avancos: parseInt(e.target.value) })}
              />

              <label>Valor por Avanço (R$):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={novaFila.valor_avancos}
                onChange={(e) => setNovaFila({ ...novaFila, valor_avancos: parseFloat(e.target.value) || 0 })}
              />

              <label>Tempo Estimado por Posição (minutos):</label>
              <input
                type="number"
                min="1"
                value={novaFila.tempo_estimado}
                onChange={(e) => setNovaFila({ ...novaFila, tempo_estimado: parseInt(e.target.value) })}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                <input
                  type="checkbox"
                  id="chamada_automatica"
                  checked={novaFila.chamada_automatica}
                  onChange={(e) => setNovaFila({ ...novaFila, chamada_automatica: e.target.checked })}
                />
                <label htmlFor="chamada_automatica">Habilitar chamada automática</label>
              </div>

              {novaFila.chamada_automatica && (
                <div>
                  <label>Intervalo entre chamadas (minutos):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={novaFila.intervalo_chamada}
                    onChange={(e) => setNovaFila({ ...novaFila, intervalo_chamada: parseInt(e.target.value) })}
                  />
                </div>
              )}

              <button onClick={handleCriarFila}>
                {editMode ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default GerenciarFilas;
