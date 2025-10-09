// ConfigU.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import './ConfigU.css';

export default function ConfigU() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="configU-container">
      <header className="configU-header">
        <img src="/assets/logos/flig-logo.svg" alt="Logo Flig" className="configU-logo" />
      </header>

      <div className="configU-content">
        <button onClick={() => navigate(-1)} className="configU-back">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="configU-card">
          <h2>Personalização</h2>
          <div className="configU-line">
            <div>
              <span className="configU-label">Alternar Tema</span>
              <p>Muda o tema da aplicação</p>
            </div>
            <div className="configU-switch-group">
              <span>Escuro</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={isDark}
                  onChange={toggleTheme}
                />
                <span className="slider"></span>
              </label>
              <span>Claro</span>
            </div>
          </div>

          <hr />

          <h2>Notificações</h2>

          <div className="configU-line">
            <div>
              <span className="configU-label">Desativar Notificações</span>
              <p>Notificações não serão mais enviadas a você</p>
            </div>
            <div className="configU-switch-group">
              <span>Desativar</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
              <span>Ativar</span>
            </div>
          </div>

          <div className="configU-line">
            <div>
              <span className="configU-label">Receber Notificações no Email</span>
              <p>Receber notificações no email</p>
            </div>
            <div className="configU-switch-group">
              <span>Não</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
              <span>Sim</span>
            </div>
          </div>

          <hr />

          <div className="configU-links">
            <p><strong>Termos de Uso</strong><br />Exibir termos de uso do aplicativo</p><br></br>
            <p><strong>Central de Ajuda</strong><br />Dúvidas ao usar o aplicativo?</p><br></br>
            <p><strong>Política de Privacidade</strong><br />Nossa política de privacidade</p>
          </div>

          <div className="configU-version">V1.0</div>
        </div>
      </div>
    </div>
  );
}
