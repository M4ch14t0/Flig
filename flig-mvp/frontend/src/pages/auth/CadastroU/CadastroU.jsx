import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/authContextImports.js';
import { useCep } from '../../../hooks/useCep.js';
import { ArrowLeft } from 'lucide-react';
import styles from './CadastroU.module.css';

export default function CadastroU() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaRepetida, setSenhaRepetida] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCpf = (value) => value.replace(/\D/g, '');

  const formatDataNascimento = (value) => {
    let formatted = value.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
    }
    if (formatted.length >= 5) {
      formatted = `${formatted.slice(0, 5)}/${formatted.slice(5, 9)}`;
    }
    return formatted;
  };

  // Usar hook personalizado para busca de CEP
  const { endereco: cepEndereco, bairro: cepBairro, cidade: cepCidade, uf: cepUf, loading: cepLoading, error: cepError } = useCep(cep.replace(/\D/g, ''));

  // Atualizar campos quando CEP for encontrado
  useEffect(() => {
    console.log('🔄 CadastroU - Dados do CEP recebidos:', {
      cepEndereco,
      cepBairro,
      cepCidade,
      cepUf,
      cepLoading,
      cepError
    });
    
    // Preencher campos se houver dados do CEP (mesmo que parcialmente)
    if (cepEndereco || cepBairro || cepCidade || cepUf) {
      console.log('✅ CadastroU - Preenchendo campos com dados do CEP');
      if (cepEndereco) setEndereco(cepEndereco);
      if (cepBairro) setBairro(cepBairro);
      if (cepCidade) setCidade(cepCidade);
      if (cepUf) setUf(cepUf);
    }
  }, [cepEndereco, cepBairro, cepCidade, cepUf]);

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

  const handleDataNascimentoChange = (e) => {
    const value = formatDataNascimento(e.target.value);
    setDataNascimento(value);
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`;
    }
    setCep(value);
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
        data_nascimento: dataNascimento.replace(/\D/g, ''),
        telefone_usuario: telefone,
        email_usuario: email,
        senha_usuario: senha,
        cep_usuario: cep.replace(/\D/g, ''),
        endereco_usuario: endereco,
        numero_usuario: numero,
        bairro_usuario: bairro,
        cidade_usuario: cidade,
        uf_usuario: uf,
      };

      const result = await register(userData, 'cliente');

      if (result.success) {
        // Redireciona para login em vez de home
        navigate('/login', { 
          state: { 
            message: result.message || 'Cadastro realizado com sucesso! Faça login para continuar.' 
          } 
        });
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
    <div className={styles['cadastro-container']}>
      {/* Lado esquerdo */}
      <div className={styles['cadastro-left']}>
        <div className={styles['cadastro-logo']}>
          <img src="/assets/logos/flig-logo.png" alt="Logo FLIG" className={styles['cadastro-logo-img']} />
          <p className={styles['cadastro-slogan']}>Soluções de Agilidade</p>
        </div>
        <div className={styles['cadastro-help']}>
          <p>Ajuda:</p>
          <p><a href="/faq"> FAQ</a></p>
          <p><a href="/faq"> Suporte</a></p>
          <p><a href="/faq"> Contate-nos</a></p>
        </div>
      </div>

      {/* Lado direito */}
      <div className={styles['cadastro-right']}>
        <button onClick={() => navigate(-1)} className={styles['cadastro-back-button']}><ArrowLeft size={16} /> Voltar</button>

        <form className={styles['cadastro-form']} onSubmit={handleSubmit}>
          <h2>Cadastro</h2>

          {error && <div className={styles['cadastro-error']}>{error}</div>}

          <input
            type="text"
            placeholder="Nome Completo:"
            className={styles['cadastro-input']}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="E-mail:"
            className={styles['cadastro-input']}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="CPF:"
            className={styles['cadastro-input']}
            value={cpf}
            onChange={handleCpfChange}
            maxLength="14"
            required
          />

          <input
            type="text"
            placeholder="Data de Nascimento (DD/MM/AAAA):"
            className={styles['cadastro-input']}
            value={dataNascimento}
            onChange={handleDataNascimentoChange}
            maxLength="10"
            required
          />

          <input
            type="text"
            placeholder="Telefone:"
            className={styles['cadastro-input']}
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="CEP:"
            className={styles['cadastro-input']}
            value={cep}
            onChange={handleCepChange}
            maxLength="9"
            required
          />
          {cepLoading && (
            <span style={{ fontSize: '12px', color: '#888' }}>
              Buscando...
            </span>
          )}
          {cepError && (
            <span style={{ color: 'red', fontSize: '12px' }}>
              {cepError}
            </span>
          )}

          <input
            type="text"
            placeholder="Endereço:"
            className={styles['cadastro-input']}
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
          />

          <div className={styles['cadastro-row']}>
            <input
              type="text"
              placeholder="Número:"
              className={styles['input-numero']}
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Bairro:"
              className={styles['input-bairro']}
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>

          <div className={styles['cadastro-row']}>
            <input
              type="text"
              placeholder="Cidade:"
              className={styles['input-cidade']}
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="UF:"
              className={styles['input-uf']}
              maxLength="2"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              required
            />
          </div>

          <input
            type="password"
            placeholder="Senha"
            className={styles['cadastro-input']}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Repita a Senha"
            className={styles['cadastro-input']}
            value={senhaRepetida}
            onChange={(e) => setSenhaRepetida(e.target.value)}
            required
          />

          <p className={styles['cadastro-login']}>
            Já tem uma conta? <a href="/login">Entrar</a>
          </p>

          <button type="submit" className={styles['cadastro-button']} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

        </form>

        <footer className={styles['cadastro-footer']}>
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>
    </div>
  );
}
