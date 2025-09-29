// LoginU.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContextImports.js';
import { ArrowLeft } from 'lucide-react';
import './LoginU.css';

export default function LoginU() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData, 'cliente');

      if (result.success) {
        const from = location.state?.from?.pathname || '/cliente/home';
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Lado esquerdo */}
      <div className="login-left">
        <button onClick={() => navigate(-1)} className="login-back-button">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="login-content">
          <h1 className="login-title">Bem vindo a FLIG!</h1>
          <p className="login-label">Entrar:</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <input
              type="email"
              name="email"
              placeholder="E-mail:"
              className="login-input"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Senha:"
              className="login-input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

            <p className="login-link">
              Ainda não tem uma conta? <a href="/cadastro-cliente">Crie agora.</a>
            </p>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Acessar'}
            </button>
          </form>
        </div>

        <footer className="login-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>

      {/* Lado direito */}
      <div className="login-right">
        <div className="login-logo">
          <img src="/assets/logos/flig-logo.svg" alt="Logo FLIG" className="login-logo-img" />
          <p className="login-slogan">Soluções de Agilidade</p>
        </div>

        <div className="login-help">
          <p>Ajuda:</p>
          <p><a href="/faq" className="login-faq">FAQ</a></p>
          <p><a href="/faq" className="login-suporte">Suporte</a></p>
          <p><a href="/faq" className="login-contato">Contate-nos</a></p>
        </div>
      </div>
    </div>
  );
}
