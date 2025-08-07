import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout({ 
  sidebarLinks = [], 
  children, 
  userType = 'cliente',
  showHeader = true,
  showSidebar = true,
  showFooter = true 
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Aqui você pode adicionar lógica de logout
    navigate('/escolha-login');
  };

  const handleProfileClick = () => {
    navigate(userType === 'cliente' ? '/cliente/perfil' : '/estabelecimento/perfil');
  };

  const handleSettingsClick = () => {
    navigate(userType === 'cliente' ? '/cliente/configuracoes' : '/estabelecimento/configuracoes');
  };

  const handleHomeClick = () => {
    navigate(userType === 'cliente' ? '/cliente/home' : '/estabelecimento/home');
  };

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      {showHeader && (
        <header className={styles.header}>
          <div className={styles.logo} onClick={handleHomeClick}>
            <img src="/logo-flig.svg" alt="Flig" className={styles.logoImg} />
          </div>
          <div className={styles.headerRight}>
            <Link to="/faq" className={styles.helpIcon} aria-label="FAQ">
              ❓
            </Link>
            <div className={styles.userIconWrapper}>
              <button className={styles.userIcon} onClick={handleProfileClick}>
                👤
              </button>
              <div className={styles.userPopup}>
                <p onClick={handleProfileClick}>👤 <u>Perfil</u></p>
                <p onClick={handleSettingsClick}>⚙️ <u>Configurações</u></p>
                <p onClick={handleLogout}>🔓 <u>Sair</u></p>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className={styles.content}>
        {/* SIDEBAR */}
        {showSidebar && sidebarLinks.length > 0 && (
          <aside className={styles.sidebar}>
            <nav className={styles.menu}>
              {sidebarLinks.map(({ to, label, icon, active }, idx) => (
                <Link 
                  key={idx} 
                  to={to} 
                  className={`${styles.menuItem} ${active || location.pathname === to ? styles.active : ''}`}
                  aria-label={label}
                >
                  {icon} {label}
                </Link>
              ))}
            </nav>
          </aside>
        )}
        
        {/* MAIN */}
        <main className={styles.main}>{children}</main>
      </div>

      {/* FOOTER */}
      {showFooter && (
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
      )}
    </div>
  );
} 