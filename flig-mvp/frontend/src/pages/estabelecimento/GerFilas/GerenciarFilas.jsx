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
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novaFila, setNovaFila] = useState({
    nome: '',
    descricao: '',
    max_avancos: 8,
    valor_avancos: 2.00,
    tempo_estimado: 5,
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
      
      const response = await api.get('/establishments/queues');
      const data = response.data;
      setFilas(data.data || []);
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
      
      const response = await api.post('/queues', payload);

      const result = response.data;
      alert('Fila criada com sucesso!');
      
      // Atualiza a lista de filas
      fetchFilas();
      setPopupVisible(false);
      setNovaFila({
        nome: '',
        descricao: '',
        max_avancos: 8,
        valor_avancos: 2.00,
        tempo_estimado: 5,
      });
    } catch (error) {
      console.error('Erro ao criar fila:', error);
      alert('Erro ao criar fila. Tente novamente.');
    }
  };

  const handleStatusChange = async (filaId, novoStatus) => {
    try {
      const response = await api.put(`/queues/${filaId}/status`, { status: novoStatus });

      alert(`Fila ${novoStatus === 'pausada' ? 'pausada' : 'reativada'} com sucesso!`);
      fetchFilas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da fila');
    }
  };

  const handleEncerrarFila = async (filaId) => {
    if (!confirm('Tem certeza que deseja encerrar esta fila? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await api.delete(`/queues/${filaId}`);

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
              <h3>Criar Fila</h3>

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

              <button onClick={handleCriarFila}>Confirmar</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default GerenciarFilas;
