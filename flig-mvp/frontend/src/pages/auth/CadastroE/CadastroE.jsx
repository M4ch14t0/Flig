// CadastroE.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from './CadastroE.module.css';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateCNPJ(cnpj) {
  return /^\d{14}$/.test(cnpj.replace(/\D/g, ""));
}

export default function CadastroE() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    razao: '',
    email: '',
    cnpj: '',
    cep: '',
    senha: '',
    senha2: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  function validate() {
    const newErrors = {};
    if (!form.razao) newErrors.razao = "Razão Social obrigatória";
    if (!form.email) newErrors.email = "E-mail obrigatório";
    else if (!validateEmail(form.email)) newErrors.email = "E-mail inválido";
    if (!form.cnpj) newErrors.cnpj = "CNPJ obrigatório";
    else if (!validateCNPJ(form.cnpj)) newErrors.cnpj = "CNPJ inválido (apenas números)";
    if (!form.cep) newErrors.cep = "CEP obrigatório";
    if (!form.senha) newErrors.senha = "Senha obrigatória";
    else if (form.senha.length < 6) newErrors.senha = "Mínimo 6 caracteres";
    if (form.senha2 !== form.senha) newErrors.senha2 = "Senhas não coincidem";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSubmitting(true);
    // Simulação de chamada de API (substitua por chamada real depois)
    setTimeout(() => {
      setSubmitting(false);
      navigate("/estabelecimento/home");
    }, 1000);
  }

  return (
    <div className={styles["empresa-cadastro-container"]}>
      {/* Lado esquerdo */}
      <div className={styles["empresa-cadastro-left"]}>
        <div className={styles["empresa-cadastro-logo"]}>
          <img src="/logo-flig.svg" alt="Logo FLIG" className={styles["empresa-cadastro-logo-img"]} />
          <p className={styles["empresa-cadastro-slogan"]}>Soluções de Agilidade</p>
        </div>
        <div className={styles["empresa-cadastro-help"]}>
          <p>Ajuda:</p>
          <p><a href="/faq"> FAQ</a></p>
          <p><a href="/faq"> Suporte</a></p>
          <p><a href="/faq"> Contate-nos</a></p>
        </div>
      </div>
      {/* Lado direito */}
      <div className={styles["empresa-cadastro-right"]}>
        <button onClick={() => navigate(-1)} className={styles["empresa-cadastro-back-button"]}>
          ← Voltar
        </button>
        <form className={styles["empresa-cadastro-form"]} onSubmit={handleSubmit} noValidate>
          <h2>Cadastro</h2>
          <input name="razao" type="text" placeholder="Razão Social:" className={styles["empresa-cadastro-input"]} value={form.razao} onChange={handleChange} />
          {errors.razao && <span className={styles["erro"]}>{errors.razao}</span>}
          <input name="email" type="email" placeholder="E-mail:" className={styles["empresa-cadastro-input"]} value={form.email} onChange={handleChange} />
          {errors.email && <span className={styles["erro"]}>{errors.email}</span>}
          <input name="cnpj" type="text" placeholder="CNPJ:" className={styles["empresa-cadastro-input"]} value={form.cnpj} onChange={handleChange} />
          {errors.cnpj && <span className={styles["erro"]}>{errors.cnpj}</span>}
          <input name="cep" type="text" placeholder="CEP:" className={styles["empresa-cadastro-input"]} value={form.cep} onChange={handleChange} />
          {errors.cep && <span className={styles["erro"]}>{errors.cep}</span>}
          <input name="senha" type="password" placeholder="Senha" className={styles["empresa-cadastro-input"]} value={form.senha} onChange={handleChange} />
          {errors.senha && <span className={styles["erro"]}>{errors.senha}</span>}
          <input name="senha2" type="password" placeholder="Repita a Senha" className={styles["empresa-cadastro-input"]} value={form.senha2} onChange={handleChange} />
          {errors.senha2 && <span className={styles["erro"]}>{errors.senha2}</span>}
          <p className={styles["empresa-cadastro-login"]}>
            Já tem uma conta? <a href="/login-estab">Entrar</a>
          </p>
          {apiError && <span className={styles["erro"]}>{apiError}</span>}
          <button type="submit" className={styles["empresa-cadastro-button"]} disabled={submitting}>{submitting ? "Enviando..." : "Criar Conta"}</button>
        </form>
      </div>
    </div>
  );
}
