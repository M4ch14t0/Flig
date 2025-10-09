import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContextImports.js';
import { useTheme } from '../contexts/ThemeContext';
import { User, Settings, LogOut, Wrench, FileText, Phone, HelpCircle } from 'lucide-react';
import styles from './Layout.module.css';

/**
 * Componente Layout - Estrutura Base da Aplicação
 *
 * Funcionalidade:
 * - Fornece estrutura consistente para todas as páginas
 * - Inclui header, sidebar, conteúdo principal e footer
 * - Gerencia navegação e funcionalidades comuns
 * - Suporta configuração flexível de elementos visíveis
 *
 * @param {Array} sidebarLinks - Array de links para a sidebar (to, label, icon, active)
 * @param {React.ReactNode} children - Conteúdo principal da página
 * @param {string} userType - Tipo de usuário ('cliente' ou 'estabelecimento')
 * @param {boolean} showHeader - Controla se o header deve ser exibido
 * @param {boolean} showSidebar - Controla se a sidebar deve ser exibida
 * @param {boolean} showFooter - Controla se o footer deve ser exibido
 * @returns {JSX.Element} - Layout completo da aplicação
 */
export default function Layout({
  sidebarLinks = [], // Links da sidebar (padrão: array vazio)
  children, // Conteúdo principal da página
  userType = 'cliente', // Tipo de usuário (padrão: cliente)
  showHeader = true, // Mostrar header (padrão: true)
  showSidebar = true, // Mostrar sidebar (padrão: true)
  showFooter = true // Mostrar footer (padrão: true)
}) {
  // Hook do React Router para navegação programática
  const navigate = useNavigate();
  // Hook do React Router para obter informações da rota atual
  const location = useLocation();
  // Hook personalizado para acessar função de logout
  const { logout } = useAuth();
  // Hook para acessar funcionalidades de tema
  const { theme, toggleTheme, isDark } = useTheme();

  /**
   * Função para fazer logout do usuário
   * Executa logout e redireciona para página de escolha de login
   */
  const handleLogout = async () => {
    await logout(); // Executa logout (limpa dados de autenticação)
    navigate('/escolha-login'); // Redireciona para escolha de perfil
  };

  /**
   * Função para navegar para página de perfil
   * Redireciona baseado no tipo de usuário
   */
  const handleProfileClick = () => {
    navigate(userType === 'cliente' ? '/cliente/perfil' : '/estabelecimento/perfil');
  };

  /**
   * Função para navegar para página de configurações
   * Redireciona baseado no tipo de usuário
   */
  const handleSettingsClick = () => {
    navigate(userType === 'cliente' ? '/cliente/configuracoes' : '/estabelecimento/configuracoes');
  };

  /**
   * Função para navegar para página inicial
   * Redireciona baseado no tipo de usuário
   */
  const handleHomeClick = () => {
    navigate(userType === 'cliente' ? '/cliente/home' : '/estabelecimento/home');
  };

  return (
    <div className={styles.wrapper}>
      {/*
        HEADER - Cabeçalho da aplicação
        Contém logo, ícones de ajuda e menu do usuário
      */}
      {showHeader && (
        <header className={styles.header}>
          {/* Logo clicável que leva para página inicial */}
          <div className={styles.logo} onClick={handleHomeClick}>
            <img src="/assets/logos/flig-logo.svg" alt="Flig" className={styles.logoImg} />
          </div>

          {/* Área direita do header com ícones e menu */}
          <div className={styles.headerRight}>
            {/* Link para FAQ */}
            <Link to="/faq" className={styles.helpIcon} aria-label="FAQ">
              <HelpCircle size={20} />
            </Link>

            {/* Botão de alternância de tema */}
            <button 
              className={styles.themeToggle} 
              onClick={toggleTheme}
              aria-label={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
              title={`Tema atual: ${theme === 'dark' ? 'Escuro' : 'Claro'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Menu do usuário com dropdown */}
            <div className={styles.userIconWrapper}>
              {/* Botão do usuário que abre dropdown */}
              <button className={styles.userIcon} onClick={handleProfileClick}>
                <User size={20} />
              </button>

              {/* Dropdown com opções do usuário */}
              <div className={styles.userPopup}>
                <p onClick={handleProfileClick}><User size={16} /> <u>Perfil</u></p> {/* Acessar perfil */}
                <p onClick={handleSettingsClick}><Settings size={16} /> <u>Configurações</u></p> {/* Acessar configurações */}
                <p onClick={handleLogout}><LogOut size={16} /> <u>Sair</u></p> {/* Fazer logout */}
              </div>
            </div>
          </div>
        </header>
      )}

      {/*
        CONTEÚDO PRINCIPAL
        Área que contém sidebar e conteúdo da página
      */}
      <div className={styles.content}>
        {/*
          SIDEBAR - Menu lateral de navegação
          Só é exibida se showSidebar for true e houver links
        */}
        {showSidebar && sidebarLinks.length > 0 && (
          <aside className={styles.sidebar}>
            <nav className={styles.menu}>
              {/* Mapeia cada link da sidebar */}
              {sidebarLinks.map(({ to, label, icon, active }, idx) => (
                <Link
                  key={idx} // Chave única para cada item
                  to={to} // Rota de destino
                  className={`${styles.menuItem} ${active || location.pathname === to ? styles.active : ''}`}
                  // Classe ativa se: link marcado como ativo OU rota atual corresponde
                  aria-label={label} // Acessibilidade
                >
                  {icon} {label} {/* Ícone + texto do link */}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/*
          MAIN - Área principal de conteúdo
          Renderiza os componentes filhos (children)
        */}
        <main className={styles.main}>{children}</main>
      </div>

      {/*
        FOOTER - Rodapé da aplicação
        Contém informações da empresa, links úteis e formulário de feedback
      */}
      {showFooter && (
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            {/* Coluna 1: Logo e informações de contato */}
            <div className={styles.footerColumn}>
              <img src="/assets/logos/flig-logo.svg" alt="Logo Flig" style={{ width: '95px' }} />
              <p><strong>FligPTI@gmail.com</strong></p>
              <div>
                {/* Redes sociais */}
                <img src="/social/instagram.svg" alt="Instagram" />
                <img src="/social/linkedin.svg" alt="LinkedIn" />
                <img src="/social/tiktok.svg" alt="TikTok" />
              </div>
            </div>

            {/* Coluna 2: Serviços oferecidos */}
            <div className={styles.footerColumn}>
              <h4>Serviços:</h4>
              <p>Login Clientes</p>
              <p>App Flig</p>
              <p>Termos de privacidade</p>
            </div>

            {/* Coluna 3: Links de ajuda */}
            <div className={styles.footerColumn}>
              <h4>Ajuda:</h4>
              <p><FileText size={16} /> FAQ</p>
              <p><Wrench size={16} /> Suporte</p>
              <p><Phone size={16} /> Contate-nos</p>
            </div>

            {/* Coluna 4: Formulário de feedback */}
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
