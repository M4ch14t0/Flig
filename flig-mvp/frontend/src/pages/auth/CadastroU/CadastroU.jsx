import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from './CadastroU.module.css';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateCPF(cpf) {
  return /^\d{11}$/.test(cpf.replace(/\D/g, ""));
}

export default function CadastroU() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    data: '',
    email: '',
    cpf: '',
    cidade: '',
    uf: '',
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
    if (!form.nome) newErrors.nome = "Nome obrigatório";
    if (!form.data) newErrors.data = "Data obrigatória";
    if (!form.email) newErrors.email = "E-mail obrigatório";
    else if (!validateEmail(form.email)) newErrors.email = "E-mail inválido";
    if (!form.cpf) newErrors.cpf = "CPF obrigatório";
    else if (!validateCPF(form.cpf)) newErrors.cpf = "CPF inválido (apenas números)";
    if (!form.cidade) newErrors.cidade = "Cidade obrigatória";
    if (!form.uf) newErrors.uf = "UF obrigatória";
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
      navigate("/cliente/home");
    }, 1000);
  }

  return (
    <div className={styles["cadastro-container"]}>
      {/* Lado esquerdo: logo e ajuda */}
      <div className={styles["cadastro-left"]}>
        <div className={styles["cadastro-logo"]}>
          <img src="/logo-flig.svg" alt="Logo FLIG" className={styles["cadastro-logo-img"]} />
          <p className={styles["cadastro-slogan"]}>Soluções de Agilidade</p>
        </div>
        <div className={styles["cadastro-help"]}>
          <p>Ajuda:</p>
          <p><a href="/faq"> FAQ</a></p>
          <p><a href="/faq"> Suporte</a></p>
          <p><a href="/faq"> Contate-nos</a></p>
        </div>
      </div>
      {/* Lado direito: formulário */}
      <div className={styles["cadastro-right"]}>
        <button onClick={() => navigate(-1)} className={styles["cadastro-back-button"]}>
          ← Voltar
        </button>
        <form className={styles["cadastro-form"]} onSubmit={handleSubmit} noValidate>
          <h2>Cadastro</h2>
          <div className={styles["cadastro-row"]}>
            <input name="nome" type="text" placeholder="Nome:" className={styles["input-nome"]} value={form.nome} onChange={handleChange} />
            <input name="data" type="date" className={styles["input-data"]} value={form.data} onChange={handleChange} />
          </div>
          {errors.nome && <span className={styles["erro"]}>{errors.nome}</span>}
          {errors.data && <span className={styles["erro"]}>{errors.data}</span>}
          <input name="email" type="email" placeholder="E-mail" className={styles["cadastro-input"]} value={form.email} onChange={handleChange} />
          {errors.email && <span className={styles["erro"]}>{errors.email}</span>}
          <input name="cpf" type="text" placeholder="CPF:" className={styles["cadastro-input"]} value={form.cpf} onChange={handleChange} />
          {errors.cpf && <span className={styles["erro"]}>{errors.cpf}</span>}
          <div className={styles["cadastro-row"]}>
            <input name="cidade" type="text" placeholder="Cidade:" className={styles["input-cidade"]} value={form.cidade} onChange={handleChange} />
            <input name="uf" type="text" placeholder="UF:" className={styles["input-uf"]} value={form.uf} onChange={handleChange} />
          </div>
          {errors.cidade && <span className={styles["erro"]}>{errors.cidade}</span>}
          {errors.uf && <span className={styles["erro"]}>{errors.uf}</span>}
          <input name="senha" type="password" placeholder="Senha" className={styles["cadastro-input"]} value={form.senha} onChange={handleChange} />
          {errors.senha && <span className={styles["erro"]}>{errors.senha}</span>}
          <input name="senha2" type="password" placeholder="Repita a Senha" className={styles["cadastro-input"]} value={form.senha2} onChange={handleChange} />
          {errors.senha2 && <span className={styles["erro"]}>{errors.senha2}</span>}
          <p className={styles["cadastro-login"]}>
            Já tem uma conta? <a href="/login">Entrar</a>
          </p>
          {apiError && <span className={styles["erro"]}>{apiError}</span>}
          <button type="submit" className={styles["cadastro-button"]} disabled={submitting}>{submitting ? "Enviando..." : "Acessar"}</button>
        </form>
        <footer className={styles["cadastro-footer"]}>
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>
    </div>
  );
}
