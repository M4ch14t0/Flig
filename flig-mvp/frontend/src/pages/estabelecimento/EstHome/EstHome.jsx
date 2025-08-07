// EstHome.jsx - Página inicial do estabelecimento
import { useNavigate } from "react-router-dom";
import styles from './EstHome.module.css';
import { Home, List, HelpCircle, User, Settings } from "lucide-react";

export default function EstHome() {
  const navigate = useNavigate();

  return (
    <div className={styles["esthome-container"]}>
      {/* Header - Topo da página */}
      <header className={styles["esthome-header"]}>
        <img src="/logo-flig.svg" alt="Flig logo" className={styles["esthome-logo"]} />
        <div className={styles["esthome-icons"]}>
          <button onClick={() => navigate("/faq") }><HelpCircle /></button>
          <button onClick={() => navigate("/estabelecimento/perfil") }><User /></button>
          <button type="button" onClick={() => navigate("/estabelecimento/configuracoes") }><Settings /></button>
        </div>
      </header>

      {/* Corpo principal */}
      <div className={styles["esthome-body"]}>
        {/* Sidebar - Menu lateral */}
        <aside className={styles["esthome-sidebar"]}>
          <button className={styles["esthome-nav-btn"]} onClick={() => navigate("/estabelecimento/home") }>
            <Home size={16} /> Home
          </button>
          <button className={styles["esthome-nav-btn"]} onClick={() => navigate("/estabelecimento/gerenciar-filas") }>
            <List size={16} /> Gerenciar Filas
          </button>
          <button className={styles["esthome-nav-btn"]} onClick={() => navigate("/estabelecimento/planos") }>
            <List size={16} /> Planos
          </button>
        </aside>

        {/* Conteúdo principal */}
        <main className={styles["esthome-main"]}>
          <h1 className={styles["esthome-welcome"]}>Bem-vindo a <strong>Flig</strong></h1>
        </main>
      </div>
    </div>
  );
}
