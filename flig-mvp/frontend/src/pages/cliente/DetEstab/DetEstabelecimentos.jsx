import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { HelpCircle, User, Settings, LogOut, Loader2, Clock, Users, MapPin } from 'lucide-react';
import styles from './DetEstabelecimentos.module.css';

// URL base da API
const API_BASE_URL = 'http://localhost:5000/api';

function DetEstabelecimentos() {
  const location = useLocation();
  const navigate = useNavigate();
  const estabelecimento = location.state?.estabelecimento;
  
  // Estados para dados das filas
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar filas do estabelecimento
  const fetchFilas = async () => {
    if (!estabelecimento?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/queues/establishment/${estabelecimento.id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar filas do estabelecimento');
      }
      
      const data = await response.json();
      setFilas(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar filas:', error);
      setError('Erro ao carregar filas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega filas quando o componente monta
  useEffect(() => {
    fetchFilas();
  }, [estabelecimento?.id]);

  // Função para entrar na fila
  const handleEntrarFila = async (fila) => {
    try {
      // Dados do cliente (em produção viria do contexto de autenticação)
      const clientData = {
        nome: 'Cliente Teste',
        telefone: '(11) 99999-9999',
        email: 'cliente@teste.com'
      };

      const response = await fetch(`${API_BASE_URL}/queues/${fila.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        throw new Error('Erro ao entrar na fila');
      }

      const result = await response.json();
      alert(`Você entrou na fila "${fila.nome}"! Posição: ${result.data.position}`);
      
      // Atualiza a lista de filas
      fetchFilas();
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
      alert('Erro ao entrar na fila. Tente novamente.');
    }
  };

  if (!estabelecimento) {
    return <div className={styles.wrapper}>Estabelecimento não encontrado.</div>;
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
          <div className={styles.estabCard}>
            <div className={styles.imageBox}></div>

            <div className={styles.infoBox}>
              <div className={styles.infoTop}>
                <div>
                  <h2>{estabelecimento.nome_empresa}</h2>
                  <div className={styles.categoryBadge}>{estabelecimento.categoria}</div>
                  <p className={styles.label}>Descrição</p>
                  <p className={styles.desc}>
                    {estabelecimento.descricao || 'Descrição não disponível.'}
                  </p>
                </div>
                <div>
                  <p className={styles.label}>
                    <MapPin size={16} /> Endereço
                  </p>
                  <p>{estabelecimento.endereco_empresa}</p>
                  <p className={styles.tempo}>
                    <Clock size={16} /> Tempo médio de espera geral: {estabelecimento.tempo_estimado || 15}min
                  </p>
                </div>
              </div>

              <div className={styles.avaliacao}>
                <h3>Avaliação</h3>
                <p><span className={styles.estrela}>⭐</span> <strong>{estabelecimento.nota?.toFixed(1) || '4.5'}</strong> ({estabelecimento.avaliacoes || 0} avaliações)</p>
                <p className={styles.status}>
                  Status: <span className={estabelecimento.status === 'ativo' ? styles.active : styles.inactive}>
                    {estabelecimento.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </p>
              </div>

              <div className={styles.filasSection}>
                <h3>
                  <Users size={20} /> Filas Disponíveis
                  {loading && <Loader2 className={styles.loader} size={16} />}
                </h3>
                
                {error ? (
                  <div className={styles.errorContainer}>
                    <p>{error}</p>
                    <button onClick={fetchFilas} className={styles.retryButton}>
                      Tentar Novamente
                    </button>
                  </div>
                ) : filas.length === 0 ? (
                  <p className={styles.noQueues}>Nenhuma fila ativa no momento.</p>
                ) : (
                  <table className={styles.tabelaFilas}>
                    <thead>
                      <tr>
                        <th>Nome da Fila</th>
                        <th>Pessoas</th>
                        <th>Tempo Estimado</th>
                        <th>Status</th>
                        <th>Ação</th>
                        <th></th>
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
                            <span className={styles.pessoasCount}>
                              {fila.stats?.totalClients || 0}
                            </span>
                          </td>
                          <td>
                            <span className={styles.tempoEstimado}>
                              {fila.stats?.averageWaitTime || 0}min
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.status} ${fila.status === 'ativa' ? styles.active : styles.inactive}`}>
                              {fila.status === 'ativa' ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className={styles.entrar}
                              onClick={() => handleEntrarFila(fila)}
                              disabled={fila.status !== 'ativa'}
                            >
                              {fila.status === 'ativa' ? 'Entrar' : 'Indisponível'}
                            </button>
                          </td>
                          <td>&gt;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DetEstabelecimentos;
