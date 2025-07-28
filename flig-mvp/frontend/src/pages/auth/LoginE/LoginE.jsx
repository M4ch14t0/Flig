// LoginE.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from './LoginE.module.css';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginE() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    senha: ''
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
    if (!form.email) newErrors.email = "E-mail obrigatório";
    else if (!validateEmail(form.email)) newErrors.email = "E-mail inválido";
    if (!form.senha) newErrors.senha = "Senha obrigatória";
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
    <div className={styles["empresa-login-container"]}>
      {/* Lado esquerdo */}
      <div className={styles["empresa-login-left"]}>
        <button onClick={() => navigate(-1)} className={styles["empresa-login-back-button"]}>
          ← Voltar
        </button>
        <div className={styles["empresa-login-content"]}>
          <h1 className={styles["empresa-login-title"]}>Bem vindo a FLIG!</h1>
          <p className={styles["empresa-login-label"]}>Entrar:</p>
          <input name="email" type="email" placeholder="E-mail:" className={styles["empresa-login-input"]} value={form.email} onChange={handleChange} />
          {errors.email && <span className={styles["erro"]}>{errors.email}</span>}
          <input name="senha" type="password" placeholder="Senha:" className={styles["empresa-login-input"]} value={form.senha} onChange={handleChange} />
          {errors.senha && <span className={styles["erro"]}>{errors.senha}</span>}
          <p className={styles["empresa-login-link"]}>
            Ainda não tem uma conta? <a href="/cadastro-estabelecimento">Crie agora.</a>
          </p>
          {apiError && <span className={styles["erro"]}>{apiError}</span>}
          <button type="submit" className={styles["empresa-login-button"]} onClick={handleSubmit} disabled={submitting}>{submitting ? "Enviando..." : "Acessar"}</button>
        </div>
        <footer className={styles["empresa-login-footer"]}>
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>
      {/* Lado direito */}
      <div className={styles["empresa-login-right"]}>
        <div className={styles["empresa-login-logo"]}>
          <img src="/logo-flig.svg" alt="Logo FLIG" className={styles["empresa-login-logo-img"]} />
          <p className={styles["empresa-login-slogan"]}>Soluções de Agilidade</p>
        </div>
        <div className={styles["empresa-login-help"]}>
          <p>Ajuda:</p>
          <p><a href="/faq" className={styles["empresa-login-faq"]}>FAQ</a></p>
          <p><a href="/faq" className={styles["empresa-login-suporte"]}>Suporte</a></p>
          <p><a href="/faq" className={styles["empresa-login-contato"]}>Contate-nos</a></p>
        </div>
      </div>
    </div>
  );
}
