// LoginE.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContextImports.js';
import './LoginE.css';

export default function LoginE() {
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
      const result = await login(formData, 'estabelecimento');

      if (result.success) {
        const from = location.state?.from?.pathname || '/estabelecimento/home';
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
    <div className="empresa-login-container">
      {/* Lado esquerdo */}
      <div className="empresa-login-left">
        <button onClick={() => navigate(-1)} className="empresa-login-back-button">
          ← Voltar
        </button>

        <div className="empresa-login-content">
          <h1 className="empresa-login-title">Bem vindo a FLIG!</h1>
          <p className="empresa-login-label">Entrar:</p>

          <form onSubmit={handleSubmit} className="empresa-login-form">
            {error && <div className="empresa-login-error">{error}</div>}

            <input
              type="email"
              name="email"
              placeholder="E-mail:"
              className="empresa-login-input"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Senha:"
              className="empresa-login-input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

            <p className="empresa-login-link">
              Ainda não tem uma conta? <a href="/cadastro-estabelecimento">Crie agora.</a>
            </p>

            <button className="empresa-login-button" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Acessar'}
            </button>
          </form>
        </div>

        <footer className="empresa-login-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>

      {/* Lado direito */}
      <div className="empresa-login-right">
        <div className="empresa-login-logo">
          <img src="/logo-flig.svg" alt="Logo FLIG" className="empresa-login-logo-img" />
          <p className="empresa-login-slogan">Soluções de Agilidade</p>
        </div>

        <div className="empresa-login-help">
          <p>Ajuda:</p>
          <p><a href="/faq" className="empresa-login-faq">FAQ</a></p>
          <p><a href="/faq" className="empresa-login-suporte">Suporte</a></p>
          <p><a href="/faq" className="empresa-login-contato">Contate-nos</a></p>
        </div>
      </div>
    </div>
  );
}
