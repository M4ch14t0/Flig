import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './GerFilas.module.css';

function GerenciarFilas() {
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(false);
  const [filas, setFilas] = useState([]);
  const [novaFila, setNovaFila] = useState({
    nome: '',
    tipo: 'comum',
    limitar: false,
    limite: '',
    horario: 'agora',
    agendamento: '',
    reserva: 'individual',
  });

  const handleCriarFila = () => {
    const nova = {
      nome: novaFila.nome,
      status: 'Ativa',
      usuarios: 0,
    };
    setFilas([...filas, nova]);
    setPopupVisible(false);
    setNovaFila({
      nome: '',
      tipo: 'comum',
      limitar: false,
      limite: '',
      horario: 'agora',
      agendamento: '',
      reserva: 'individual',
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo}>Flig</div>
        <div className={styles.headerRight}>
          <Link to="/faq" className={styles.helpIcon}>❓</Link>
          <div className={styles.userIconWrapper}>
            <button className={styles.userIcon}>👤</button>
            <div className={styles.userPopup}>
              <p>👤 <u>Perfil</u></p>
              <p>⚙️ <u>Configurações</u></p>
              <p>🔓 <u>Sair</u></p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className={styles.content}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <nav className={styles.menu}>
            <Link to="/home" className={styles.homeActive}>🏠 Home</Link>
            <Link to="/dashboard" className={styles.dashboardActive}>📊 Dashboard</Link>
            <Link to="/gerenciar-filas" className={styles.gerActive}>👥 Gerenciar Filas</Link>
            <Link to="/planos" className={styles.planosActive}>💳 Planos</Link>
          </nav>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          <h2>Gerenciar Filas</h2>
          <div className={styles.barTop}>
            <input type="text" placeholder="Pesquisar Filas..." />
            <button onClick={() => setPopupVisible(true)}>Criar Fila</button>
          </div>

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
              {filas.map((fila, idx) => (
                <tr key={idx}>
                  <td>{fila.nome}</td>
                  <td>{fila.status}</td>
                  <td>{fila.usuarios}</td>
                  <td>
                    <button>Pausar</button>
                    <button>Chamada</button>
                    <button>Encerrar</button>
                    <button onClick={() => navigate('/gerenciar-filas/fila')}>{'>'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>

        {/* POPUP */}
        {popupVisible && (
          <div className={styles.popupOverlay} onClick={() => setPopupVisible(false)}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
              <h3>Criar Fila</h3>

              <label>Nome da Fila:</label>
              <input
                placeholder="Ex: Preferencial"
                value={novaFila.nome}
                onChange={(e) => setNovaFila({ ...novaFila, nome: e.target.value })}
              />

              <label>Tipo de Fila:</label>
              <select
                value={novaFila.tipo}
                onChange={(e) => setNovaFila({ ...novaFila, tipo: e.target.value })}
              >
                <option value="comum">Comum</option>
                <option value="preferencial">Preferencial</option>
                <option value="avanço">Com Avanço</option>
              </select>

              <label>
                <input
                  type="checkbox"
                  checked={novaFila.limitar}
                  onChange={(e) => setNovaFila({ ...novaFila, limitar: e.target.checked })}
                />
                Limitar número de integrantes
              </label>

              {novaFila.limitar && (
                <>
                  <label>Máximo de Pessoas:</label>
                  <input
                    type="number"
                    value={novaFila.limite}
                    onChange={(e) => setNovaFila({ ...novaFila, limite: e.target.value })}
                  />
                </>
              )}

              <label>Horário de Abertura:</label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="horario"
                    value="agora"
                    checked={novaFila.horario === 'agora'}
                    onChange={(e) => setNovaFila({ ...novaFila, horario: e.target.value })}
                  />
                  Abrir Agora
                </label>
                <label>
                  <input
                    type="radio"
                    name="horario"
                    value="agendado"
                    checked={novaFila.horario === 'agendado'}
                    onChange={(e) => setNovaFila({ ...novaFila, horario: e.target.value })}
                  />
                  Agendar Horário
                </label>
              </div>

              {novaFila.horario === 'agendado' && (
                <>
                  <label>Horário:</label>
                  <input
                    type="time"
                    value={novaFila.agendamento}
                    onChange={(e) => setNovaFila({ ...novaFila, agendamento: e.target.value })}
                  />
                </>
              )}

              <label>Tipo de Reserva:</label>
              <select
                value={novaFila.reserva}
                onChange={(e) => setNovaFila({ ...novaFila, reserva: e.target.value })}
              >
                <option value="individual">Individual</option>
                <option value="grupo">Grupo</option>
              </select>

              <button onClick={handleCriarFila}>Confirmar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarFilas;
