import { useNavigate, Link } from "react-router-dom";
import { HelpCircle, User, Settings } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import "./ContaE.css";

export default function ContaE() {
  const navigate = useNavigate();

  return (
    <div className="contaE-container">
      <header className="contaE-header">
        <img src="/logo-flig.svg" alt="Logo Flig" className="contaE-logo" />
        <div className="contaE-icons">
          <button onClick={() => navigate("/faq")}><HelpCircle /></button>
          <button onClick={() => navigate("/contae")}><User /></button>
          <button type="button" onClick={() => navigate("/confige")}><Settings /></button>
        </div>
      </header>

      <main className="contaE-main">
        <section className="contaE-form-box">
          <button className="contaE-back" onClick={() => navigate("/home-estabelecimento")}>
            <ArrowLeft size={18} /> Voltar
          </button>

          <h2>Dados da Empresa</h2>

          <div className="contaE-form-wrapper">
            <form className="contaE-form">
              <input type="text" placeholder="Razão Social:" />
              <input type="text" placeholder="CNPJ:" />
              <input type="text" placeholder="Telefone:" />
              <input type="text" placeholder="CEP:" />
              <div className="contaE-row">
                <input type="text" placeholder="Endereço:" className="input-longo" />
                <input type="text" placeholder="Nº:" className="input-curto" />
              </div>
              <div className="contaE-salvar-wrapper">
                <button type="submit" className="btn-salvar">Salvar Alterações</button>
              </div>
            </form>

            <div className="contaE-avatar">
              <img src="/avatar-placeholder.png" alt="Avatar" />
              <button className="btn-editar-avatar">Editar Imagem de Perfil</button>
            </div>
          </div>
        </section>

        <div className="contaE-grid">
          <div className="contaE-card">
            <h3>Conta e Acesso</h3>
            <div className="contaE-info">
              <label htmlFor="email">E-mail:</label>
              <input type="email" id="email" defaultValue="housemage@flig.com.br" />
              <button>Alterar</button>
            </div>
            <div className="contaE-info">
              <label htmlFor="senha">Senha:</label>
              <input type="password" id="senha" defaultValue="12345678" />
              <button>Alterar</button>
            </div>
          </div>

          <div className="contaE-card">
            <h3>Plano da Empresa</h3>
            <p>Plano: <strong>Profissional</strong> (ativo)</p>
            <p>Válido até: <strong>16/09/2025</strong></p>
          </div>

          <div className="contaE-card">
            <h3>Encerrar Sessões</h3>
            <button className="btn-sair">🔒 Encerrar Sessões</button>
            <p>Termine a sessão de forma segura em todos os dispositivos conectados.</p>
          </div>

          <div className="contaE-card">
            <h3>Excluir Conta</h3>
            <button className="btn-delete">🗑 Excluir conta</button>
            <p>Se você não deseja mais utilizar a Flig, pode solicitar a exclusão permanente de sua conta.</p>
          </div>
        </div>

        <footer className="contaE-footer">
          <p>Ao utilizar a Flig, você concorda com nossos <strong>Termos de Serviço</strong>.</p>
        </footer>
      </main>
    </div>
  );
}
