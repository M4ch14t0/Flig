import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../contexts/authContextImports.js';
import { ArrowLeft } from 'lucide-react';
import './CadastroU.css';

export default function CadastroU() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [erroCpf, setErroCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaRepetida, setSenhaRepetida] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCpf = (value) => value.replace(/\D/g, '');

  const handleCpfBlur = async () => {
    const cleanCpf = formatCpf(cpf);

    if (cleanCpf.length !== 11 || !dataNasc) {
      if (cleanCpf.length > 0 && cleanCpf.length !== 11) {
        setErroCpf('CPF deve conter 11 dígitos');
      } else if (!dataNasc) {
        setErroCpf('Informe a data de nascimento');
      }
      return;
    }

    // Para desenvolvimento, vamos simular a validação do CPF
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simular validação bem-sucedida
      if (cleanCpf.length === 11) {
        setNome('Usuário Teste');
        setErroCpf('');
      } else {
        setErroCpf('CPF inválido');
        setNome('');
      }
    } catch {
      setErroCpf('Erro ao verificar CPF. Verifique sua conexão.');
      setNome('');
    }
  };

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    if (value.length >= 5) value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
    setDataNasc(value);
  };

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    setCpf(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (senha !== senhaRepetida) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        nome_usuario: nome,
        cpf: cpf.replace(/\D/g, ''),
        telefone_usuario: '',
        email_usuario: email,
        senha_usuario: senha,
        cep_usuario: '',
        endereco_usuario: cidade,
        numero_usuario: uf,
      };

      const result = await register(userData, 'cliente');

      if (result.success) {
        navigate('/cliente/home');
      } else {
        setError(result.error);
      }
    } catch {
      setError('Erro interno ao tentar cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-container">
      {/* Lado esquerdo */}
      <div className="cadastro-left">
        <div className="cadastro-logo">
          <img src="/assets/logos/flig-logo.svg" alt="Logo FLIG" className="cadastro-logo-img" />
          <p className="cadastro-slogan">Soluções de Agilidade</p>
        </div>
        <div className="cadastro-help">
          <p>Ajuda:</p>
          <p><a href="/faq"> FAQ</a></p>
          <p><a href="/faq"> Suporte</a></p>
          <p><a href="/faq"> Contate-nos</a></p>
        </div>
      </div>

      {/* Lado direito */}
      <div className="cadastro-right">
        <button onClick={() => navigate(-1)} className="cadastro-back-button"><ArrowLeft size={16} /> Voltar</button>

        <form className="cadastro-form" onSubmit={handleSubmit}>
          <h2>Cadastro</h2>

          {error && <div className="cadastro-error">{error}</div>}

          <div className="cadastro-row">
            <input
              type="text"
              placeholder="Nome:"
              className="input-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="text"
              placeholder="Data de Nascimento (dd/mm/yyyy):"
              className="input-data"
              value={dataNasc}
              onChange={handleDateChange}
              maxLength="10"
            />
          </div>

          <input
            type="email"
            placeholder="E-mail"
            className="cadastro-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="CPF:"
            className="cadastro-input"
            value={cpf}
            onChange={handleCpfChange}
            onBlur={handleCpfBlur}
            maxLength="14"
          />
          {erroCpf && <p className="erro-cpf">{erroCpf}</p>}

          <div className="cadastro-row">
            <input
              type="text"
              placeholder="Cidade:"
              className="input-cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
            <input
              type="text"
              placeholder="UF:"
              className="input-uf"
              maxLength="2"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
            />
          </div>

          <input
            type="password"
            placeholder="Senha"
            className="cadastro-input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Repita a Senha"
            className="cadastro-input"
            value={senhaRepetida}
            onChange={(e) => setSenhaRepetida(e.target.value)}
            required
          />

          <p className="cadastro-login">
            Já tem uma conta? <a href="/login">Entrar</a>
          </p>

          <button type="submit" className="cadastro-button" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

        </form>

        <footer className="cadastro-footer">
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>
    </div>
  );
}
