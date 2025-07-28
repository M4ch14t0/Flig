import { useNavigate } from "react-router-dom";
import { Home, List } from "lucide-react";
import { HelpCircle, User, Settings } from "lucide-react";
import styles from './Plano.module.css';

export default function Plano() {
  const navigate = useNavigate();

  return (
    <div className={styles["plano-container"]}>
      <header className={styles["plano-header"]}>
        <img src="/logo-flig.svg" alt="Logo Flig" className={styles["plano-logo"]} />
        <h1>Planos</h1>
        <div className={styles["plano-icons"]}>
          <button onClick={() => navigate("/faq") }><HelpCircle /></button>
          <button onClick={() => navigate("/estabelecimento/perfil") }><User /></button>
          <button type="button" onClick={() => navigate("/estabelecimento/configuracoes") }><Settings /></button>
        </div>
      </header>

      <div className={styles["plano-content"]}>
        <aside className={styles["plano-sidebar"]}>
          <button className={styles["plano-nav-btn"]} onClick={() => navigate("/estabelecimento/home") }><Home size={16} /> Home</button>
          <button className={styles["plano-nav-btn"]} onClick={() => navigate("/estabelecimento/gerenciar-filas") }><List size={16} /> Gerenciar Filas</button>
          <button className={styles["plano-nav-btn"]} onClick={() => navigate("/estabelecimento/planos") }><List size={16} /> Planos</button>
        </aside>

        <main className={styles["plano-main"]}>
          <div className={styles["plano-card"]}>
            <h2>Essencial</h2>
            <p className={styles["plano-preco"]}>R$ 89,90/mês</p>
            <button onClick={() => navigate("/estabelecimento/planos/renovar") } className={styles["plano-btn renovar"]}>
              Renovar Contrato
            </button>
          </div>

          <div className={styles["plano-card"]}>
            <h2>Profissional</h2>
            <p className={styles["plano-preco"]}>R$ 189,90/mês</p>
            <button onClick={() => navigate("/estabelecimento/planos/assinar") } className={styles["plano-btn assinar"]}>
              Assinar Plano
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
