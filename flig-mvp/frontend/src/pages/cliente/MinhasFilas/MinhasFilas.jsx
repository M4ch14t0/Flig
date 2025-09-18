import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, User, Settings, LogOut, Clock, Users, ArrowUp, CreditCard } from 'lucide-react';
import styles from './MinhasFilas.module.css';

function MinhasFilas() {
  const navigate = useNavigate();
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('cliente.teste@email.com'); // Email do usuário logado

  // Buscar filas do usuário
  useEffect(() => {
    fetchUserQueues();
  }, []);

  const fetchUserQueues = async () => {
    try {
      setLoading(true);
      // Buscar todas as filas ativas
      const response = await fetch('http://localhost:5000/api/queues/establishment/1');
      if (!response.ok) throw new Error('Erro ao buscar filas');
      
      const data = await response.json();
      if (data.success) {
        // Filtrar filas onde o usuário está presente
        const userQueues = [];
        for (const fila of data.data) {
          try {
            const clientsResponse = await fetch(`http://localhost:5000/api/queues/${fila.id}/clients`);
            if (clientsResponse.ok) {
              const clientsData = await clientsResponse.json();
              if (clientsData.success) {
                const userInQueue = clientsData.data.clients.find(client => 
                  client.email === userEmail
                );
                if (userInQueue) {
                  userQueues.push({
                    ...fila,
                    userPosition: userInQueue.position,
                    totalClients: clientsData.data.clients.length
                  });
                }
              }
            }
          } catch (err) {
            console.warn(`Erro ao buscar clientes da fila ${fila.id}:`, err);
          }
        }
        setFilas(userQueues);
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
      const response = await fetch(`http://localhost:5000/api/queues/${queueId}/advance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: userEmail,
          positions: 1, // Avançar 1 posição
          paymentMethod: 'simulado' // Pagamento simulado
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Posição avançada! Nova posição: ${data.data.newPosition}`);
          fetchUserQueues(); // Atualizar lista
        } else {
          alert(`Erro: ${data.message}`);
        }
      } else {
        alert('Erro ao avançar posição');
      }
    } catch (err) {
      console.error('Erro ao avançar posição:', err);
      alert('Erro ao avançar posição');
    }
  };
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

        {/* MAIN */}
        <main className={styles.main}>
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
                        <h3>Estabelecimento Teste Flig</h3>
                        <button className={styles.sairBtn}>Sair <span>⏏</span></button>
                      </div>
                      <p><strong>{fila.nome}</strong> - {fila.totalClients} pessoas</p>
                      <p><strong>Posição</strong> - {fila.userPosition}º</p>
                      
                      <div className={styles.queueInfo}>
                        <div className={styles.infoItem}>
                          <Clock size={16} />
                          <span>Tempo estimado: {Number(fila.tempo_estimado || 0)}min</span>
                        </div>
                        <div className={styles.infoItem}>
                          <Users size={16} />
                          <span>{fila.totalClients} pessoas na fila</span>
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <button 
                          className={styles.avanBtn}
                          onClick={() => handleAdvancePosition(fila.id, fila.userPosition)}
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
        </main>
      </div>
    </div>
  );
}

export default MinhasFilas;
