import { useNavigate } from "react-router-dom";
import { Home, List, ArrowLeft } from "lucide-react";
import styles from './Plano.module.css';
import stylesA from './PlanoA.module.css'; // Reutiliza o estilo da página de renovação

export default function PlanoA() {
  const navigate = useNavigate();

  return (
    <div className="plano-container">
      <header className="plano-header">
        <img src="/logo-flig.svg" alt="Logo Flig" className="plano-logo" />
        <h1>Assinatura de Plano </h1>
      </header>

      <div className="plano-content">
        <aside className="plano-sidebar">
          <button className="plano-nav-btn" onClick={() => navigate("/estabelecimento/home") }><Home size={16} /> Home</button>
          <button className="plano-nav-btn" onClick={() => navigate("/estabelecimento/gerenciar-filas") }><List size={16} /> Gerenciar Filas</button>
          <button className="plano-nav-btn" onClick={() => navigate("/estabelecimento/planos") }><List size={16} /> Planos</button>
        </aside>

        <main className="planoa-main">
          <button className="planoa-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>

          <div className="planoa-card">
            <div className="planoa-info">
              <h2>Plano: <span>Profissional</span></h2>
              <p><strong>Valor:</strong> R$ 198,90/mês</p>
              <p><strong>Tempo de Plano:</strong> 365 dias</p>
              <p><strong>Expira em:</strong> 19/06/2025</p>
              <p><strong>Tempo restante:</strong> 29 dias</p>
              <button className="planoa-btn">Assinar Plano</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
