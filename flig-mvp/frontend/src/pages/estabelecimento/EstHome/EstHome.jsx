// EstHome.jsx
import { useNavigate } from "react-router-dom";
import "./EstHome.css";
import { Home, List, HelpCircle, User, Settings } from "lucide-react";
import ContaE from "../ContaE/ContaE";

export default function EstHome() {
  const navigate = useNavigate();

  return (
    <div className="esthome-container">
      {/* Topo */}
      <header className="esthome-header">
        <img src="/logo-flig.svg" alt="Flig logo" className="esthome-logo" />
        <div className="esthome-icons">
          <button onClick={() => navigate("/faq")}><HelpCircle /></button>
          <button onClick={() => navigate("/ContaE")}><User /></button>
          <button type="button" onClick={() => navigate("/ConfigE")}><Settings /></button>
        </div>
      </header>

      {/* Corpo */}
      <div className="esthome-body">
        {/* Sidebar */}
        <aside className="esthome-sidebar">
          <button className="esthome-nav-btn"><Home size={16} /> Home</button>
          <button className="esthome-nav-btn"><List size={16} /> Gerenciar Filas</button>
          <button className="esthome-nav-btn" onClick={() => navigate("/plano")}><List size={16} /> Planos</button>
        </aside>

        {/* Conteúdo principal */}
        <main className="esthome-main">
          <h1 className="esthome-welcome">Bem-vindo a <strong>Flig</strong></h1>
        </main>
      </div>
    </div>
  );
}
