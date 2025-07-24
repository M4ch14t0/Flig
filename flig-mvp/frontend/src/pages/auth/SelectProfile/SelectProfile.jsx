import { useNavigate } from "react-router-dom";
import "./SelectProfile.css";

export default function SelectProfile() {
  const navigate = useNavigate();

  return (
    <div className="select-container">
      <div className="select-left">
        <button onClick={() => navigate(-1)} className="select-back-button">
          ← Voltar
        </button>

        <div className="select-content">
          <h1 className="select-title">Bem vindo a FLIG!</h1>
          <p className="select-subtitle">Você é:</p>

          <div className="select-options">
            <button
              onClick={() => navigate("/cliente")}
              className="select-button"
            >
              Cliente
            </button>
            <button
              onClick={() => navigate("/estabelecimento")}
              className="select-button"
            >
              Estabelecimento
            </button>
          </div>
        </div>

        <footer className="select-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>

      <div className="select-right">
        <div className="select-logo">
          <img src="/logo-flig.svg" alt="Flig logo" className="select-logo-img" />
          <p className="select-slogan">Soluções de Agilidade</p>
        </div>

        <div className="select-help">
            <p>Ajuda:</p>
            <p><a href="/faq" className="select-faq"> FAQ</a></p>
            <p><a href="/faq" className="select-suporte"> Suporte</a></p>
            <p><a href="/faq" className="select-contato"> Contate-nos</a></p>
        </div>
      </div>
    </div>
  );
}
