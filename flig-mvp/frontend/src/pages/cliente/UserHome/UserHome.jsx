// UserHome.jsx
import { useNavigate } from "react-router-dom";
import "./UserHome.css";
import { Home, MapPin, List, HelpCircle, User, Settings } from "lucide-react";

export default function UserHome() {
  const navigate = useNavigate();

  return (
    <div className="userhome-container">
      {/* Topo */}
      <header className="userhome-header">
        <img src="/logo-flig.svg" alt="Flig logo" className="userhome-logo" />
        <div className="userhome-icons">
          <button onClick={() => navigate("/faq")}><HelpCircle /></button>
          <button onClick={() => navigate("/conta")}><User /></button>
          <button type="button" onClick={() => navigate("/configu")}><Settings /></button>
        </div>
      </header>

      {/* Corpo */}
      <div className="userhome-body">
        {/* Sidebar */}
        <aside className="userhome-sidebar">
          <button className="userhome-nav-btn"><Home size={16} /> Home</button>
          <button className="userhome-nav-btn"><MapPin size={16} /> Estabelecimentos</button>
          <button className="userhome-nav-btn"><List size={16} /> Minhas Filas</button>
        </aside>

        {/* Conteúdo principal */}
        <main className="userhome-main">
          <h1 className="userhome-welcome">Bem-vindo a <strong>Flig</strong></h1>
        </main>
      </div>
    </div>
  );
}
