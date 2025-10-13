import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { api } from '../../../services/api';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Erro ao enviar email de recuperação');
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      setError('Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-left">
          <button onClick={() => navigate(-1)} className="forgot-password-back-button">
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="forgot-password-content">
            <div className="forgot-password-success">
              <Mail size={48} className="success-icon" />
              <h1>Email enviado!</h1>
              <p>Enviamos um link de recuperação para:</p>
              <strong>{email}</strong>
              <p>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
              <p>O link expira em 15 minutos.</p>
            </div>
          </div>

          <footer className="forgot-password-footer">
            Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
          </footer>
        </div>

        <div className="forgot-password-right">
          <div className="forgot-password-image">
            <h2>Recuperação de Senha</h2>
            <p>Verifique seu email para continuar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-left">
        <button onClick={() => navigate(-1)} className="forgot-password-back-button">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="forgot-password-content">
          <h1 className="forgot-password-title">Esqueci minha senha</h1>
          <p className="forgot-password-label">Digite seu email para receber um link de recuperação:</p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            {error && <div className="forgot-password-error">{error}</div>}

            <input
              type="email"
              name="email"
              placeholder="E-mail:"
              className="forgot-password-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              className="forgot-password-button"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        </div>

        <footer className="forgot-password-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>

      <div className="forgot-password-right">
        <div className="forgot-password-image">
          <h2>Recuperação de Senha</h2>
          <p>Digite seu email para receber um link seguro de recuperação</p>
        </div>
      </div>
    </div>
  );
}

