// EstHome.jsx
import { useNavigate } from "react-router-dom";
import styles from './EstHome.module.css';
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
          <button onClick={() => navigate("/faq") }><HelpCircle /></button>
          <button onClick={() => navigate("/estabelecimento/perfil") }><User /></button>
          <button type="button" onClick={() => navigate("/estabelecimento/configuracoes") }><Settings /></button>
        </div>
      </header>

      {/* Corpo */}
      <div className="esthome-body">
        {/* Sidebar */}
        <aside className="esthome-sidebar">
          <button className="esthome-nav-btn" onClick={() => navigate("/estabelecimento/home") }><Home size={16} /> Home</button>
          <button className="esthome-nav-btn" onClick={() => navigate("/estabelecimento/gerenciar-filas") }><List size={16} /> Gerenciar Filas</button>
          <button className="esthome-nav-btn" onClick={() => navigate("/estabelecimento/planos") }><List size={16} /> Planos</button>
        </aside>

        {/* Conteúdo principal */}
        <main className="esthome-main">
          <h1 className="esthome-welcome">Bem-vindo a <strong>Flig</strong></h1>
        </main>
      </div>
    </div>
  );
}
