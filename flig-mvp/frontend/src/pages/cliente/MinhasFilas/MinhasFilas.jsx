import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MinhasFilas.module.css';

const filasMock = [
  {
    id: 1,
    estabelecimento: 'Estabelecimento A',
    fila: 'Fila A',
    pessoas: 57,
    posicao: 21
  },
  {
    id: 2,
    estabelecimento: 'Estabelecimento B',
    fila: 'Fila Preferencial',
    pessoas: 12,
    posicao: 4
  }
];

function MinhasFilas() {
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

      {/* CONTEÚDO PRINCIPAL */}
      <div className={styles.content}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
            <nav className={styles.menu}>
                <Link to="/home" className={styles.homeActive}>🏠 Home</Link>
                <Link to="/estabelecimentos" className={styles.estabActive}>📍 Estabelecimentos</Link>
                <Link to="/minhasfilas" className={styles.filasActive}>👥 Minhas Filas</Link>
            </nav>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          <h2 className={styles.pageTitle}>Minhas Filas</h2>

          <div className={styles.filasLista}>
            {filasMock.map((fila) => (
              <div key={fila.id} className={styles.filaCard}>
                <div className={styles.cardImage}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTop}>
                    <h3>{fila.estabelecimento}</h3>
                    <button className={styles.sairBtn}>Sair <span>⏏</span></button>
                  </div>
                  <p><strong>{fila.fila}</strong> - {fila.pessoas} pessoas</p>
                  <p><strong>Posição</strong> - {fila.posicao}º</p>
                  <button className={styles.avanBtn}>Avançar Posições</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MinhasFilas;
