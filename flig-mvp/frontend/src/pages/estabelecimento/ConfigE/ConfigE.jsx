import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from './ConfigE.module.css';

export default function ConfigE() {
  const navigate = useNavigate();

  return (
    <div className={styles["configE-container"]}>
      <header className={styles["configE-header"]}>
        <img src="/logo-flig.svg" alt="Logo Flig" className={styles["configE-logo"]} />
      </header>
      <div className={styles["configE-content"]}>
        <button onClick={() => navigate("/estabelecimento/home") } className={styles["configE-back"]}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className={styles["configE-card"]}>
          <h2>Configurações</h2>
          <h3>Personalização</h3>
          <div className={styles["configE-line"]}>
            <div>
              <span className={styles["configE-label"]}>Alternar Tema</span>
              <p>Muda o tema de exibição</p>
            </div>
            <div className={styles["configE-switch-group"]}>
              <span>Escuro</span>
              <label className={styles["switch"]}>
                <input type="checkbox" />
                <span className={styles["slider"]}></span>
              </label>
              <span>Claro</span>
            </div>
          </div>
          <hr />
          <h3>Dados e Backup</h3>
          <div className={styles["configE-line"]}>
            <div>
              <span className={styles["configE-label"]}>Exportar Relatório de dados</span>
              <p>Exportar o relatório de dados gerado</p>
            </div>
            <button className={styles["configE-export-button"]}>Exportar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
