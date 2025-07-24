import { useNavigate } from "react-router-dom";
import { Home, List } from "lucide-react";
import { HelpCircle, User, Settings } from "lucide-react";
import "./Plano.css";

export default function Plano() {
  const navigate = useNavigate();

  return (
    <div className="plano-container">
      <header className="plano-header">
        <img src="/logo-flig.svg" alt="Logo Flig" className="plano-logo" />
        <h1>Planos</h1>
        <div className="plano-icons">
          <button onClick={() => navigate("/faq")}><HelpCircle /></button>
          <button onClick={() => navigate("/contae")}><User /></button>
          <button type="button" onClick={() => navigate("/confige")}><Settings /></button>
        </div>
      </header>

      <div className="plano-content">
        <aside className="plano-sidebar">
          <button className="plano-nav-btn" onClick={() => navigate("/home-estabelecimento")}><Home size={16} /> Home</button>
          <button className="plano-nav-btn"><List size={16} /> Gerenciar Filas</button>
          <button className="plano-nav-btn" onClick={() => navigate("/plano")}><List size={16} /> Planos</button>
        </aside>

        <main className="plano-main">
          <div className="plano-card">
            <h2>Essencial</h2>
            <p className="plano-preco">R$ 89,90/mês</p>
            <button onClick={() => navigate("/planor")} className="plano-btn renovar">
              Renovar Contrato
            </button>
          </div>

          <div className="plano-card">
            <h2>Profissional</h2>
            <p className="plano-preco">R$ 189,90/mês</p>
            <button onClick={() => navigate("/planoa")} className="plano-btn assinar">
              Assinar Plano
            </button>
          </div>
        </main>
      </div>

      <footer className="plano-footer">
        <p>Entre em contato com a Flig para mais informações.</p>
        <p>Copyright © 2023 Flig Soluções de agilidade. Todos os Direitos Reservados.</p>
      </footer>
    </div>
  );
}
