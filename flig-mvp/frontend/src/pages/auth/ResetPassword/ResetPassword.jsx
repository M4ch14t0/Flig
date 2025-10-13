import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';
import './ResetPassword.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  // Verificar se o token é válido ao carregar a página
  useEffect(() => {
    if (!token) {
      setError('Token de recuperação não encontrado');
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await api.get(`/api/auth/validate-reset-token/${token}`);
        setTokenValid(response.data.success);
        if (!response.data.success) {
          setError('Token inválido ou expirado');
        }
      } catch (error) {
        console.error('Erro ao validar token:', error);
        setTokenValid(false);
        setError('Token inválido ou expirado');
      }
    };

    validateToken();
  }, [token]);

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

    // Validações
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        password: formData.password
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-left">
          <button onClick={() => navigate('/login')} className="reset-password-back-button">
            <ArrowLeft size={16} /> Voltar ao Login
          </button>

          <div className="reset-password-content">
            <div className="reset-password-error">
              <AlertCircle size={48} className="error-icon" />
              <h1>Token inválido</h1>
              <p>Este link de recuperação é inválido ou expirou.</p>
              <p>Por favor, solicite um novo link de recuperação.</p>
              <button 
                onClick={() => navigate('/forgot-password')}
                className="reset-password-button"
              >
                Solicitar novo link
              </button>
            </div>
          </div>

          <footer className="reset-password-footer">
            Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
          </footer>
        </div>

        <div className="reset-password-right">
          <div className="reset-password-logo">
            <img src="/assets/logos/flig-logo.svg" alt="Flig Logo" className="reset-password-logo-img" />
            <p className="reset-password-slogan">Transformando a experiência de espera</p>
          </div>
          <div className="reset-password-help">
            <p>Precisa de ajuda?</p>
            <a href="/faq">FAQ</a> | <a href="/contato">Contato</a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-left">
          <button onClick={() => navigate('/login')} className="reset-password-back-button">
            <ArrowLeft size={16} /> Voltar ao Login
          </button>

          <div className="reset-password-content">
            <div className="reset-password-success">
              <CheckCircle size={48} className="success-icon" />
              <h1>Senha redefinida!</h1>
              <p>Sua senha foi alterada com sucesso.</p>
              <p>Agora você pode fazer login com sua nova senha.</p>
              <button 
                onClick={() => navigate('/login')}
                className="reset-password-button"
              >
                Fazer Login
              </button>
            </div>
          </div>

          <footer className="reset-password-footer">
            Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
          </footer>
        </div>

        <div className="reset-password-right">
          <div className="reset-password-logo">
            <img src="/assets/logos/flig-logo.svg" alt="Flig Logo" className="reset-password-logo-img" />
            <p className="reset-password-slogan">Transformando a experiência de espera</p>
          </div>
          <div className="reset-password-help">
            <p>Precisa de ajuda?</p>
            <a href="/faq">FAQ</a> | <a href="/contato">Contato</a>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-left">
          <div className="reset-password-content">
            <div className="reset-password-loading">
              <h1>Verificando link...</h1>
              <p>Por favor, aguarde.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-left">
        <button onClick={() => navigate('/login')} className="reset-password-back-button">
          <ArrowLeft size={16} /> Voltar ao Login
        </button>

        <div className="reset-password-content">
          <h1 className="reset-password-title">Redefinir senha</h1>
          <p className="reset-password-label">Digite sua nova senha:</p>

          <form onSubmit={handleSubmit} className="reset-password-form">
            {error && <div className="reset-password-error-message">{error}</div>}

            <input
              type="password"
              name="password"
              placeholder="Nova senha:"
              className="reset-password-input"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar nova senha:"
              className="reset-password-input"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              minLength={6}
            />

            <button
              type="submit"
              className="reset-password-button"
              disabled={loading}
            >
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>
        </div>

        <footer className="reset-password-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>

      <div className="reset-password-right">
        <div className="reset-password-logo">
          <img src="/assets/logos/flig-logo.svg" alt="Flig Logo" className="reset-password-logo-img" />
          <p className="reset-password-slogan">Transformando a experiência de espera</p>
        </div>
        <div className="reset-password-help">
          <p>Precisa de ajuda?</p>
          <a href="/faq">FAQ</a> | <a href="/contato">Contato</a>
        </div>
      </div>
    </div>
  );
}
