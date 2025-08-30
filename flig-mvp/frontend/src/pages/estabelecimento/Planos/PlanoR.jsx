import { useNavigate } from 'react-router-dom';
import { Home, List, ArrowLeft } from 'lucide-react';
import './Plano.css';
import './PlanoR.css';

export default function PlanoR() {
  const navigate = useNavigate();

  return (
    <div className="plano-container">
      <header className="plano-header">
        <img src="/logo-flig.svg" alt="Logo Flig" className="plano-logo" />
        <h1>Renovação de Plano</h1>
      </header>

      <div className="plano-content">
        <aside className="plano-sidebar">
          <button className="plano-nav-btn" onClick={() => navigate('/estabelecimento/home')}><Home size={16} /> Home</button>
          <button className="plano-nav-btn"><List size={16} /> Gerenciar Filas</button>
          <button className="plano-nav-btn" onClick={() => navigate('/estabelecimento/planos')}><List size={16} /> Planos</button>
        </aside>

        <main className="planor-main">
          <button className="planor-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>

          <div className="planor-card">
            <div className="planor-info">
              <h2>Plano: <span>Essencial</span></h2>
              <p><strong>Valor:</strong> R$ 89,90/mês</p>
              <p><strong>Assinado em:</strong> 19/06/2024</p>
              <p><strong>Expira em:</strong> 19/06/2025</p>
              <p><strong>Tempo restante:</strong> 29 dias</p>
              <button className="planor-btn">Renovar Contrato</button>
            </div>

            <div className="planor-beneficios">
              <h3>Benefícios do Plano</h3>
              <ul>
                <li>✔ Filas ilimitadas</li>
                <li>✔ Notificações automáticas para clientes</li>
                <li>✔ Painel básico com visão geral das filas</li>
                <li>✔ Suporte por e-mail</li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      <footer className="plano-footer">
        <p>Copyright ©2025 Flig Soluções de agilidade. Todos os Direitos Reservados.</p>
      </footer>
    </div>
  );
}
