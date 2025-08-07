// UserHome.jsx - Página inicial do cliente
import { useNavigate } from "react-router-dom";
import styles from './UserHome.module.css';
import { Home, MapPin, List, HelpCircle, User, Settings } from "lucide-react";

export default function UserHome() {
  const navigate = useNavigate();

  return (
    <div className={styles["userhome-container"]}>
      {/* Header - Topo da página */}
      <header className={styles["userhome-header"]}>
        <img src="/logo-flig.svg" alt="Flig logo" className={styles["userhome-logo"]} />
        <div className={styles["userhome-icons"]}>
          <button onClick={() => navigate("/faq") }><HelpCircle /></button>
          <button onClick={() => navigate("/cliente/perfil") }><User /></button>
          <button type="button" onClick={() => navigate("/cliente/configuracoes") }><Settings /></button>
        </div>
      </header>

      {/* Corpo principal */}
      <div className={styles["userhome-body"]}>
        {/* Sidebar - Menu lateral */}
        <aside className={styles["userhome-sidebar"]}>
          <button className={styles["userhome-nav-btn"]} onClick={() => navigate("/cliente/home") }>
            <Home size={16} /> Home
          </button>
          <button className={styles["userhome-nav-btn"]} onClick={() => navigate("/cliente/estabelecimentos") }>
            <MapPin size={16} /> Estabelecimentos
          </button>
          <button className={styles["userhome-nav-btn"]} onClick={() => navigate("/cliente/minhas-filas") }>
            <List size={16} /> Minhas Filas
          </button>
        </aside>

        {/* Conteúdo principal */}
        <main className={styles["userhome-main"]}>
          <h1 className={styles["userhome-welcome"]}>Bem-vindo a <strong>Flig</strong></h1>
        </main>
      </div>
    </div>
  );
}
