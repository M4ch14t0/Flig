import { useNavigate, Link,  } from "react-router-dom";
import { ArrowLeft, Settings, User, HelpCircle } from "lucide-react";
import ConfigU from "../ConfigU/ConfigU"; 
import "./ContaU.css";

export default function ContaU() {
  const navigate = useNavigate();

  return (
    <div className="contaU-container">
      <header className="contaU-header">
  <img src="/logo-flig.svg" alt="Logo Flig" className="contaU-logo" />
  <div className="contaU-icons">
  <button onClick={() => navigate("/faq")}><HelpCircle /></button>
  <button onClick={() => navigate("/conta")}><User /></button>
  <button type="button" onClick={() => navigate("/configu")}><Settings /></button>
  </div>
</header>

      <main className="contaU-main">
        <section className="contaU-form-box">
          <button className="contaU-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>

          <h2>Dados Pessoais</h2>

          <form className="contaU-form">
            <input type="text" placeholder="Nome Completo:" />
            <input type="text" placeholder="CPF:" />
            <input type="text" placeholder="Telefone:" />
            <input type="text" placeholder="CEP:" />
            <div className="contaU-row">
              <input type="text" placeholder="Endereço:" className="input-longo" />
              <input type="text" placeholder="Nº:" className="input-curto" />
            </div>
            <div className="contaU-salvar-wrapper">
              <button type="submit" className="btn-salvar">Salvar Alterações</button>
            </div>
          </form>
        </section>

        <div className="contaU-grid">
          <div className="contaU-card contaU-access">
            <h3>Conta de acesso</h3>
            <div className="contaU-info">
              <label htmlFor="email">E-mail:</label>
              <input type="email" id="email" defaultValue="housegreg@flig.com.br" />
              <button>Alterar</button>
            </div>
            <div className="contaU-info">
              <label htmlFor="senha">Senha:</label>
              <input type="password" id="senha" defaultValue="12345678" />
              <button>Alterar</button>
            </div>
          </div>

          <div className="contaU-card contaU-delete">
            <h3>Excluir conta</h3>
            <button className="btn-delete">🗑 Excluir conta</button>
            <p>Se você não deseja mais utilizar a Flig, pode solicitar a exclusão permanente de sua conta.</p>
          </div>

          <div className="contaU-card contaU-sessions">
            <h3>Encerrar sessões</h3>
            <button className="btn-sair">🔒 Encerrar Sessões</button>
            <p>Termine a sessão de forma segura em todos os dispositivos conectados.</p>
          </div>

          <div className="contaU-card contaU-terms">
            <h3>Termos de serviço</h3>
            <p>Ao utilizar a Flig, você concorda com nossos Termos de Serviço. Recomendamos a leitura para entender melhor suas responsabilidades e direitos ao usar a plataforma.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
