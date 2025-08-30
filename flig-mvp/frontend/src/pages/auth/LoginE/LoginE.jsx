// LoginE.jsx
import { useNavigate } from 'react-router-dom';
import './LoginE.css';

export default function LoginE() {
  const navigate = useNavigate();

  return (
    <div className="empresa-login-container">
      {/* Lado esquerdo */}
      <div className="empresa-login-left">
        <button onClick={() => navigate(-1)} className="empresa-login-back-button">
          ← Voltar
        </button>

        <div className="empresa-login-content">
          <h1 className="empresa-login-title">Bem vindo a FLIG!</h1>
          <p className="empresa-login-label">Entrar:</p>

          <input type="email" placeholder="E-mail:" className="empresa-login-input" />
          <input type="password" placeholder="Senha:" className="empresa-login-input" />

          <p className="empresa-login-link">
            Ainda não tem uma conta? <a href="/cadastro-estabelecimento">Crie agora.</a>
          </p>

          <button className="empresa-login-button"onClick={() => navigate('/estabelecimento/home')}>
          Acessar</button>
        </div>

        <footer className="empresa-login-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>

      {/* Lado direito */}
      <div className="empresa-login-right">
        <div className="empresa-login-logo">
          <img src="/logo-flig.svg" alt="Logo FLIG" className="empresa-login-logo-img" />
          <p className="empresa-login-slogan">Soluções de Agilidade</p>
        </div>

        <div className="empresa-login-help">
          <p>Ajuda:</p>
          <p><a href="/faq" className="empresa-login-faq">FAQ</a></p>
          <p><a href="/faq" className="empresa-login-suporte">Suporte</a></p>
          <p><a href="/faq" className="empresa-login-contato">Contate-nos</a></p>
        </div>
      </div>
    </div>
  );
}
