import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './CadastroE.module.css';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateCNPJ(cnpj) {
  return /^\d{14}$/.test(cnpj.replace(/\D/g, ''));
}

export default function CadastroE() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    razao: '',
    email: '',
    cnpj: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    uf: '',
    senha: '',
    senha2: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [cnpjValido, setCnpjValido] = useState(true);

  // Buscar dados do CEP
  useEffect(() => {
    if (form.cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${form.cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            setForm(prev => ({
              ...prev,
              endereco: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              uf: data.uf || ''
            }));
          }
        })
        .catch((err) => console.error('Erro ao buscar CEP:', err));
    }
  }, [form.cep]);

  // Buscar dados do CNPJ (via backend)
  useEffect(() => {
    if (form.cnpj.length === 14) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/validate-cnpj`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cnpj: form.cnpj })
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Validação de CNPJ:', data);
  
          if (data.success && data.data && data.data.razao_social) {
            setForm(prev => ({ ...prev, razao: data.data.razao_social }));
            setCnpjValido(true);
          } else if (data.success) {
            // CNPJ válido mas sem dados da API
            setCnpjValido(true);
          } else {
            setCnpjValido(false);
          }
        })
        .catch((err) => {
          console.error('Erro ao validar CNPJ:', err);
          setCnpjValido(false);
        });
    } else {
      setCnpjValido(true);
    }
  }, [form.cnpj]);
  

  function handleChange(e) {
    const { name, value } = e.target;

    // Formatação específica para CNPJ e CEP
    let formattedValue = value;
    if (name === 'cnpj') {
      formattedValue = value.replace(/\D/g, '').slice(0, 14);
    } else if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '').slice(0, 8);
    }

    setForm({ ...form, [name]: formattedValue });
    setErrors({ ...errors, [name]: undefined });
  }

  function validate() {
    const newErrors = {};
    if (!form.razao) newErrors.razao = 'Razão Social obrigatória';
    if (!form.email) newErrors.email = 'E-mail obrigatório';
    else if (!validateEmail(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.cnpj) newErrors.cnpj = 'CNPJ obrigatório';
    else if (!validateCNPJ(form.cnpj)) newErrors.cnpj = 'CNPJ inválido (apenas números)';
    else if (!cnpjValido) newErrors.cnpj = 'CNPJ inválido';
    if (!form.cep) newErrors.cep = 'CEP obrigatório';
    if (!form.endereco) newErrors.endereco = 'Endereço obrigatório';
    if (!form.senha) newErrors.senha = 'Senha obrigatória';
    else if (form.senha.length < 8) newErrors.senha = 'Mínimo 8 caracteres';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.senha)) newErrors.senha = 'Deve conter maiúscula, minúscula e número';
    if (form.senha2 !== form.senha) newErrors.senha2 = 'Senhas não coincidem';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSubmitting(true);

    const empresa = {
      nome_empresa: form.razao,
      cnpj: form.cnpj,
      cep_empresa: form.cep,
      endereco_empresa: form.endereco,
      telefone_empresa: form.telefone || '',
      email_empresa: form.email,
      senha_empresa: form.senha,
      descricao: form.descricao || '',
      categoria: form.categoria || '',
      horario_funcionamento: form.horario || ''
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register/establishment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empresa),
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (data.success) {
        // TODO: Implementar notificação toast
        console.log('Empresa cadastrada com sucesso!');
        navigate('/estabelecimento/home');
      } else {
        setApiError(data.message || 'Erro ao cadastrar empresa');
      }
    } catch (err) {
      console.error('Erro ao cadastrar empresa:', err);
      setApiError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles['empresa-cadastro-container']}>
      {/* Lado esquerdo */}
      <div className={styles['empresa-cadastro-left']}>
        <div className={styles['empresa-cadastro-logo']}>
          <img src="/assets/logos/flig-logo.svg" alt="Logo FLIG" className={styles['empresa-cadastro-logo-img']} />
          <p className={styles['empresa-cadastro-slogan']}>Soluções de Agilidade</p>
        </div>
        <div className={styles['empresa-cadastro-help']}>
          <p>Ajuda:</p>
          <p><a href="/faq"> FAQ</a></p>
          <p><a href="/faq"> Suporte</a></p>
          <p><a href="/faq"> Contate-nos</a></p>
        </div>
      </div>
      {/* Lado direito */}
      <div className={styles['empresa-cadastro-right']}>
        <button onClick={() => navigate(-1)} className={styles['empresa-cadastro-back-button']}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <form className={styles['empresa-cadastro-form']} onSubmit={handleSubmit} noValidate>
          <h2>Cadastro</h2>
          <input
            name="razao"
            type="text"
            placeholder="Razão Social:"
            className={styles['empresa-cadastro-input']}
            value={form.razao}
            onChange={handleChange}
          />
          {errors.razao && <span className={styles['erro']}>{errors.razao}</span>}
          <input
            name="email"
            type="email"
            placeholder="E-mail:"
            className={styles['empresa-cadastro-input']}
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className={styles['erro']}>{errors.email}</span>}
          <input
            name="cnpj"
            type="text"
            placeholder="CNPJ:"
            className={styles['empresa-cadastro-input']}
            value={form.cnpj}
            onChange={handleChange}
            style={{ borderColor: cnpjValido ? '' : 'red' }}
          />
          {errors.cnpj && <span className={styles['erro']}>{errors.cnpj}</span>}
          <input
            name="cep"
            type="text"
            placeholder="CEP:"
            className={styles['empresa-cadastro-input']}
            value={form.cep}
            onChange={handleChange}
          />
          {errors.cep && <span className={styles['erro']}>{errors.cep}</span>}
          <input
            name="endereco"
            type="text"
            placeholder="Endereço:"
            className={styles['empresa-cadastro-input']}
            value={form.endereco}
            onChange={handleChange}
          />
          {errors.endereco && <span className={styles['erro']}>{errors.endereco}</span>}
          <input
            name="bairro"
            type="text"
            placeholder="Bairro:"
            className={styles['empresa-cadastro-input']}
            value={form.bairro}
            onChange={handleChange}
          />
          <input
            name="cidade"
            type="text"
            placeholder="Cidade:"
            className={styles['empresa-cadastro-input']}
            value={form.cidade}
            onChange={handleChange}
          />
          <input
            name="uf"
            type="text"
            placeholder="UF:"
            className={styles['empresa-cadastro-input']}
            value={form.uf}
            onChange={handleChange}
          />
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            className={styles['empresa-cadastro-input']}
            value={form.senha}
            onChange={handleChange}
          />
          {errors.senha && <span className={styles['erro']}>{errors.senha}</span>}
          <input
            name="senha2"
            type="password"
            placeholder="Repita a Senha"
            className={styles['empresa-cadastro-input']}
            value={form.senha2}
            onChange={handleChange}
          />
          {errors.senha2 && <span className={styles['erro']}>{errors.senha2}</span>}
          <p className={styles['empresa-cadastro-login']}>
            Já tem uma conta? <a href="/login-estab">Entrar</a>
          </p>
          {apiError && <span className={styles['erro']}>{apiError}</span>}
          <button
            type="submit"
            className={styles['empresa-cadastro-button']}
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}

