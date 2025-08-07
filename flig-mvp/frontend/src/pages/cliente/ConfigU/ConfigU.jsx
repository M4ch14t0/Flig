// ConfigU.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from './ConfigU.module.css';

export default function ConfigU() {
  const navigate = useNavigate();

  return (
    <div className={styles["configU-container"]}>
      <header className={styles["configU-header"]}>
        <img src="/logo-flig.svg" alt="Logo Flig" className={styles["configU-logo"]} />
      </header>
      <div className={styles["configU-content"]}>
        <button onClick={() => navigate("/cliente/home") } className={styles["configU-back"]}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className={styles["configU-card"]}>
          <h2>Configurações</h2>
          <div className={styles["configU-line"]}>
            <div>
              <span className={styles["configU-label"]}>Alternar Tema</span>
              <p>Muda o tema da aplicação</p>
            </div>
            <div className={styles["configU-switch-group"]}>
              <span>Escuro</span>
              <label className={styles["switch"]}>
                <input type="checkbox" />
                <span className={styles["slider"]}></span>
              </label>
              <span>Claro</span>
            </div>
          </div>
          <hr />
          <h2>Notificações</h2>
          <div className={styles["configU-line"]}>
            <div>
              <span className={styles["configU-label"]}>Desativar Notificações</span>
              <p>Notificações não serão mais enviadas a você</p>
            </div>
            <div className={styles["configU-switch-group"]}>
              <span>Desativar</span>
              <label className={styles["switch"]}>
                <input type="checkbox" />
                <span className={styles["slider"]}></span>
              </label>
              <span>Ativar</span>
            </div>
          </div>
          <div className={styles["configU-line"]}>
            <div>
              <span className={styles["configU-label"]}>Receber Notificações no Email</span>
              <p>Receber notificações no email</p>
            </div>
            <div className={styles["configU-switch-group"]}>
              <span>Não</span>
              <label className={styles["switch"]}>
                <input type="checkbox" />
                <span className={styles["slider"]}></span>
              </label>
              <span>Sim</span>
            </div>
          </div>
          <hr />
          <div className={styles["configU-links"]}>
            <p><strong>Termos de Uso</strong><br />Exibir termos de uso do aplicativo</p><br></br>
            <p><strong>Central de Ajuda</strong><br />Dúvidas ao usar o aplicativo?</p><br></br>
            <p><strong>Política de Privacidade</strong><br />Nossa política de privacidade</p>
          </div>
          <div className={styles["configU-version"]}>V1.0</div>
        </div>
      </div>
    </div>
  );
}
