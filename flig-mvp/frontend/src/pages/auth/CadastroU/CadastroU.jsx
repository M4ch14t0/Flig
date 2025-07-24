import { useNavigate } from "react-router-dom";
import "./CadastroU.css";

export default function CadastroU() {
  const navigate = useNavigate();

  return (
    <div className="cadastro-container">
      {/* Lado esquerdo: logo e ajuda */}
      <div className="cadastro-left">
        <div className="cadastro-logo">
          <img src="/logo-flig.svg" alt="Logo FLIG" className="cadastro-logo-img" />
          <p className="cadastro-slogan">Soluções de Agilidade</p>
        </div>

        <div className="cadastro-help">
          <p>Ajuda:</p>
          <p><a href="/faq"> FAQ</a></p>
          <p><a href="/faq"> Suporte</a></p>
          <p><a href="/faq"> Contate-nos</a></p>
        </div>
      </div>

      {/* Lado direito: formulário */}
      <div className="cadastro-right">
        <button onClick={() => navigate(-1)} className="cadastro-back-button">
          ← Voltar
        </button>

        <form className="cadastro-form">
          <h2>Cadastro</h2>

          <div className="cadastro-row">
            <input type="text" placeholder="Nome:" className="input-nome" />
            <input type="date" className="input-data" />
          </div>

          <input type="email" placeholder="E-mail" className="cadastro-input" />
          <input type="text" placeholder="CPF:" className="cadastro-input" />

          <div className="cadastro-row">
            <input type="text" placeholder="Cidade:" className="input-cidade" />
            <input type="text" placeholder="UF:" className="input-uf" />
          </div>

          <input type="password" placeholder="Senha" className="cadastro-input" />
          <input type="password" placeholder="Repita a Senha" className="cadastro-input" />

          <p className="cadastro-login">
            Já tem uma conta? <a href="/cliente">Entrar</a>
          </p>

          <button onClick={() => navigate("/cliente")} className="cadastro-button">Acessar</button>
        </form>

        <footer className="cadastro-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>
    </div>
  );
}
