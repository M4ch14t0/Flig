// LoginU.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from './LoginU.module.css';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginU() {
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
      navigate("/cliente/home");
    }, 1000);
  }

  return (
    <div className={styles["login-container"]}>
      {/* Lado esquerdo */}
      <div className={styles["login-left"]}>
        <button onClick={() => navigate(-1)} className={styles["login-back-button"]}>
          ← Voltar
        </button>
        <div className={styles["login-content"]}>
          <h1 className={styles["login-title"]}>Bem vindo a FLIG!</h1>
          <p className={styles["login-label"]}>Entrar:</p>
          <input name="email" type="email" placeholder="E-mail:" className={styles["login-input"]} value={form.email} onChange={handleChange} />
          {errors.email && <span className={styles["erro"]}>{errors.email}</span>}
          <input name="senha" type="password" placeholder="Senha:" className={styles["login-input"]} value={form.senha} onChange={handleChange} />
          {errors.senha && <span className={styles["erro"]}>{errors.senha}</span>}
          <p className={styles["login-link"]}>
            Ainda não tem uma conta? <a href="/cadastro-cliente">Crie agora.</a>
          </p>
          {apiError && <span className={styles["erro"]}>{apiError}</span>}
          <button type="submit" className={styles["login-button"]} onClick={handleSubmit} disabled={submitting}>{submitting ? "Enviando..." : "Acessar"}</button>
        </div>
        <footer className={styles["login-footer"]}>
          Copyright© 2025 Flig Soluções de Agilidade. Todos os Direitos Reservados
        </footer>
      </div>
      {/* Lado direito */}
      <div className={styles["login-right"]}>
        <div className={styles["login-logo"]}>
          <img src="/logo-flig.svg" alt="Logo FLIG" className={styles["login-logo-img"]} />
          <p className={styles["login-slogan"]}>Soluções de Agilidade</p>
        </div>
        <div className={styles["login-help"]}>
          <p>Ajuda:</p>
          <p><a href="/faq" className={styles["login-faq"]}>FAQ</a></p>
          <p><a href="/faq" className={styles["login-suporte"]}>Suporte</a></p>
          <p><a href="/faq" className={styles["login-contato"]}>Contate-nos</a></p>
        </div>
      </div>
    </div>
  );
}
