import { useNavigate } from "react-router-dom";
import styles from './SelectProfile.module.css';

export default function SelectProfile() {
  const navigate = useNavigate();

  return (
    <div className={styles["select-container"]}>
      <div className={styles["select-left"]}>
        <button onClick={() => navigate(-1)} className={styles["select-back-button"]}>
          ← Voltar
        </button>
        <div className={styles["select-content"]}>
          <h1 className={styles["select-title"]}>Bem vindo a FLIG!</h1>
          <p className={styles["select-subtitle"]}>Você é:</p>
          <div className={styles["select-options"]}>
            <button
              onClick={() => navigate("/login")}
              className={styles["select-button"]}
            >
              Cliente
            </button>
            <button
              onClick={() => navigate("/login-estab")}
              className={styles["select-button"]}
            >
              Estabelecimento
            </button>
          </div>
        </div>
        <footer className={styles["select-footer"]}>
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>
      <div className={styles["select-right"]}>
        <div className={styles["select-logo"]}>
          <img src="/logo-flig.svg" alt="Flig logo" className={styles["select-logo-img"]} />
          <p className={styles["select-slogan"]}>Soluções de Agilidade</p>
        </div>
        <div className={styles["select-help"]}>
            <p>Ajuda:</p>
            <p><a href="/faq" className={styles["select-faq"]}> FAQ</a></p>
            <p><a href="/faq" className={styles["select-suporte"]}> Suporte</a></p>
            <p><a href="/faq" className={styles["select-contato"]}> Contate-nos</a></p>
        </div>
      </div>
    </div>
  );
}
