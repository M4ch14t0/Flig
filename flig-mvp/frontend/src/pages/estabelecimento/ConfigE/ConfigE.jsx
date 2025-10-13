import React from 'react';
import Layout from '../../../components/Layout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import './ConfigE.css';

export default function ConfigE() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Layout userType="estabelecimento" showSidebar={false}>
      <div className="configE-container">
        <div className="configE-content">
          <button onClick={() => navigate(-1)} className="configE-back">
            <ArrowLeft size={18} /> Voltar
          </button>
          <div className="configE-card">
            <h2>Configurações</h2>

            <h3>Personalização</h3>
            <div className="configE-line">
              <div>
                <span className="configE-label">Alternar Tema</span>
                <p>Muda o tema da aplicação</p>
              </div>
              <div className="configE-switch-group">
                <span>Claro</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isDark}
                    onChange={toggleTheme}
                  />
                  <span className="slider"></span>
                </label>
                <span>Escuro</span>
              </div>
            </div>

            <hr />

            <h3>Dados e Backup</h3>
            <div className="configE-line">
              <div>
                <span className="configE-label">Exportar Relatório de dados</span>
                <p>Exportar o relatório de dados gerado</p>
              </div>
              <button className="configE-export-button">Exportar</button>
            </div>

            <div className="configE-line">
              <div>
                <span className="configE-label">Backup automático de dados</span>
                <p>Ativar automaticamente o backup de dados</p>
              </div>
              <div className="configE-switch-group">
                <span>Desativado</span>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
                <span>Ativado</span>
              </div>
            </div>

            <hr />

            <div className="configE-links">
              <p><strong>Termos de Uso</strong><br />Exibir termos de uso do aplicativo</p><br />
              <p><strong>Central de Ajuda</strong><br />Dúvidas ao usar o aplicativo?</p><br />
              <p><strong>Política de Privacidade</strong><br />Nossa política de privacidade</p>
            </div>

            <div className="configE-version">V1.0</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
