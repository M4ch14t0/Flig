// LoginU.jsx
import { useNavigate } from "react-router-dom";
import "./LoginU.css";

export default function LoginU() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      {/* Lado esquerdo */}
      <div className="login-left">
        <button onClick={() => navigate(-1)} className="login-back-button">
          ← Voltar
        </button>

        <div className="login-content">
          <h1 className="login-title">Bem vindo a FLIG!</h1>
          <p className="login-label">Entrar:</p>

          <input type="email" placeholder="E-mail:" className="login-input" />
          <input type="password" placeholder="Senha:" className="login-input" />

          <p className="login-link">
            Ainda não tem uma conta? <a href="/cadastro-cliente">Crie agora.</a>
          </p>

          <button className="login-button" onClick={() => navigate("/cliente/home")}>
          Acessar
          </button>

        </div>

        <footer className="login-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>

      {/* Lado direito */}
      <div className="login-right">
        <div className="login-logo">
          <img src="/logo-flig.svg" alt="Logo FLIG" className="login-logo-img" />
          <p className="login-slogan">Soluções de Agilidade</p>
        </div>

        <div className="login-help">
          <p>Ajuda:</p>
          <p><a href="/faq" className="login-faq">FAQ</a></p>
          <p><a href="/faq" className="login-suporte">Suporte</a></p>
          <p><a href="/faq" className="login-contato">Contate-nos</a></p>
        </div>
      </div>
    </div>
  );
}
