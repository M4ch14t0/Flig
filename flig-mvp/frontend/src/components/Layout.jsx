import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout({ sidebarLinks = [], children, userType = 'cliente' }) {
  const navigate = useNavigate();
  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate(userType === 'cliente' ? '/cliente/home' : '/estabelecimento/home')}>Flig</div>
        <div className={styles.headerRight}>
          <Link to="/faq" className={styles.helpIcon} aria-label="FAQ">❓</Link>
          <div className={styles.userIconWrapper}>
            <button className={styles.userIcon} onClick={() => navigate(userType === 'cliente' ? '/cliente/perfil' : '/estabelecimento/perfil')}>👤</button>
            <div className={styles.userPopup}>
              <p onClick={() => navigate(userType === 'cliente' ? '/cliente/perfil' : '/estabelecimento/perfil')}>👤 <u>Perfil</u></p>
              <p onClick={() => navigate(userType === 'cliente' ? '/cliente/configuracoes' : '/estabelecimento/configuracoes')}>⚙️ <u>Configurações</u></p>
              <p>🔓 <u>Sair</u></p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <nav className={styles.menu}>
            {sidebarLinks.map(({ to, label, icon, active }, idx) => (
              <Link key={idx} to={to} className={active ? styles.active : ''} aria-label={label} tabIndex={0}>
                {icon} {label}
              </Link>
            ))}
          </nav>
        </aside>
        {/* MAIN */}
        <main className={styles.main}>{children}</main>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerColumn}>
            <img src="/logo-footer.svg" alt="Logo Flig" style={{ width: '80px' }} />
            <p><strong>FligPTI@gmail.com</strong></p>
            <div>
              <img src="/social/instagram.svg" alt="Instagram" />
              <img src="/social/linkedin.svg" alt="LinkedIn" />
              <img src="/social/tiktok.svg" alt="TikTok" />
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4>Serviços:</h4>
            <p>Login Clientes</p>
            <p>App Flig</p>
            <p>Termos de privacidade</p>
          </div>
          <div className={styles.footerColumn}>
            <h4>Ajuda:</h4>
            <p>📑 FAQ</p>
            <p>🛠️ Suporte</p>
            <p>📞 Contate-nos</p>
          </div>
          <div className={styles.footerColumn}>
            <h4>Tem alguma dica pra gente?</h4>
            <p>Dê um FeedBack! Agradecemos Muito</p>
            <div className={styles.footerInput}>
              <input type="text" placeholder="Digite Aqui..." aria-label="Feedback" />
              <img src="/icons/send.svg" alt="Enviar" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 