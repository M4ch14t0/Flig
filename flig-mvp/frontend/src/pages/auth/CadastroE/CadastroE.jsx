// CadastroE.jsx
import { useNavigate } from "react-router-dom";
import "./CadastroE.css";

export default function CadastroE() {
  const navigate = useNavigate();

  return (
    <div className="empresa-cadastro-container">
      {/* Lado esquerdo */}
      <div className="empresa-cadastro-left">
        <div className="empresa-cadastro-logo">
          <img src="/logo-flig.svg" alt="Logo FLIG" className="empresa-cadastro-logo-img" />
          <p className="empresa-cadastro-slogan">Soluções de Agilidade</p>
        </div>

        <div className="empresa-cadastro-help">
          <p>Ajuda:</p>
          <p><a href="/faq"> FAQ</a></p>
          <p><a href="/faq"> Suporte</a></p>
          <p><a href="/faq"> Contate-nos</a></p>
        </div>
      </div>

      {/* Lado direito */}
      <div className="empresa-cadastro-right">
        <button onClick={() => navigate(-1)} className="empresa-cadastro-back-button">
          ← Voltar
        </button>

        <form className="empresa-cadastro-form">
          <h2>Cadastro</h2>
          <input type="text" placeholder="Razão Social:" className="empresa-cadastro-input" />
          <input type="email" placeholder="E-mail:" className="empresa-cadastro-input" />
          <input type="text" placeholder="CNPJ:" className="empresa-cadastro-input" />
          <input type="text" placeholder="CEP:" className="empresa-cadastro-input" />
          <input type="password" placeholder="Senha" className="empresa-cadastro-input" />
          <input type="password" placeholder="Repita a Senha" className="empresa-cadastro-input" />

          <p className="empresa-cadastro-login">
            Já tem uma conta? <a href="/estabelecimento">Entrar</a>
          </p>

          <button onClick={() => navigate("/estabelecimento")} className="empresa-cadastro-button">Criar Conta</button>
        </form>

        <footer className="empresa-cadastro-footer">
          Copyright© 2025 Flig Soluções de agilidade. Todos os Direitos Reservados
        </footer>
      </div>
    </div>
  );
}
