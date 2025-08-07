import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import styles from './DetEstabelecimentos.module.css';

function DetEstabelecimentos() {
  const location = useLocation();
  const navigate = useNavigate();
  const estabelecimento = location.state?.estabelecimento;

  if (!estabelecimento) {
    return <div className={styles.wrapper}>Estabelecimento não encontrado.</div>;
  }

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo}>Flig</div>
        <div className={styles.headerRight}>
          <Link to="/faq" className={styles.helpIcon}>❓</Link>
          <div className={styles.userIconWrapper}>
            <button className={styles.userIcon} onClick={() => navigate('/cliente/perfil')}>👤</button>
            <div className={styles.userPopup}>
              <p onClick={() => navigate('/cliente/perfil')}>👤 <u>Perfil</u></p>
              <p onClick={() => navigate('/cliente/configuracoes')}>⚙️ <u>Configurações</u></p>
              <p>🔓 <u>Sair</u></p>
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
                  <h2>{estabelecimento.nome}</h2>
                  <p className={styles.label}>Descrição</p>
                  <p className={styles.desc}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra nisi ut nisl interdum tincidunt.
                  </p>
                </div>
                <div>
                  <p className={styles.label}>Endereço</p>
                  <p>Av. das Palmeiras Imperiais, 123 - Vila Esperança Alta - São Paulo - SP, 00000-000</p>
                  <p className={styles.tempo}>Tempo médio de espera geral: 15min</p>
                </div>
              </div>

              <div className={styles.avaliacao}>
                <h3>Avaliação</h3>
                <p><span className={styles.estrela}>⭐</span> <strong>{estabelecimento.nota}</strong> ({estabelecimento.avaliacoes} avaliações)</p>
              </div>

              <table className={styles.tabelaFilas}>
                <thead>
                  <tr>
                    <th>Filas</th>
                    <th>Pessoas</th>
                    <th>Média espera</th>
                    <th>Horário</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Fila A</td>
                    <td>57</td>
                    <td>20min</td>
                    <td>Agora</td>
                    <td><button className={styles.entrar}>Entrar</button></td>
                    <td>&gt;</td>
                  </tr>
                  <tr>
                    <td>Fila B</td>
                    <td>21</td>
                    <td>00</td>
                    <td>19:25h</td>
                    <td><button className={styles.entrar}>Entrar</button></td>
                    <td>&gt;</td>
                  </tr>
                  <tr>
                    <td>Fila P</td>
                    <td>5</td>
                    <td>10min</td>
                    <td>Agora</td>
                    <td><button className={styles.entrar}>Entrar</button></td>
                    <td>&gt;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DetEstabelecimentos;
