import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Settings, User, HelpCircle } from "lucide-react";
import { useState } from "react";
import ConfigU from "../ConfigU/ConfigU"; 
import styles from './ContaU.module.css';

function validateCPF(cpf) {
  return /^\d{11}$/.test(cpf.replace(/\D/g, ""));
}

export default function ContaU() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: ''
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
    if (!form.cpf) newErrors.cpf = "CPF obrigatório";
    else if (!validateCPF(form.cpf)) newErrors.cpf = "CPF inválido (apenas números)";
    if (!form.telefone) newErrors.telefone = "Telefone obrigatório";
    if (!form.cep) newErrors.cep = "CEP obrigatório";
    if (!form.endereco) newErrors.endereco = "Endereço obrigatório";
    if (!form.numero) newErrors.numero = "Número obrigatório";
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
      // Redirecionar ou mostrar mensagem de sucesso
    }, 1000);
  }

  return (
    <div className={styles["contaU-container"]}>
      <header className={styles["contaU-header"]}>
        <img src="/logo-flig.svg" alt="Logo Flig" className={styles["contaU-logo"]} />
        <div className={styles["contaU-icons"]}>
          <button onClick={() => navigate("/faq") }><HelpCircle /></button>
          <button onClick={() => navigate("/cliente/perfil") }><User /></button>
          <button type="button" onClick={() => navigate("/cliente/configuracoes") }><Settings /></button>
        </div>
      </header>
      <main className={styles["contaU-main"]}>
        <section className={styles["contaU-form-box"]}>
          <button className={styles["contaU-back"]} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <h2>Dados Pessoais</h2>
          <form className={styles["contaU-form"]} onSubmit={handleSubmit} noValidate>
            <input name="nome" type="text" placeholder="Nome Completo:" value={form.nome} onChange={handleChange} />
            {errors.nome && <span className={styles["erro"]}>{errors.nome}</span>}
            <input name="cpf" type="text" placeholder="CPF:" value={form.cpf} onChange={handleChange} />
            {errors.cpf && <span className={styles["erro"]}>{errors.cpf}</span>}
            <input name="telefone" type="text" placeholder="Telefone:" value={form.telefone} onChange={handleChange} />
            {errors.telefone && <span className={styles["erro"]}>{errors.telefone}</span>}
            <input name="cep" type="text" placeholder="CEP:" value={form.cep} onChange={handleChange} />
            {errors.cep && <span className={styles["erro"]}>{errors.cep}</span>}
            <div className={styles["contaU-row"]}>
              <input name="endereco" type="text" placeholder="Endereço:" className={styles["input-longo"]} value={form.endereco} onChange={handleChange} />
              <input name="numero" type="text" placeholder="Nº:" className={styles["input-curto"]} value={form.numero} onChange={handleChange} />
            </div>
            {errors.endereco && <span className={styles["erro"]}>{errors.endereco}</span>}
            {errors.numero && <span className={styles["erro"]}>{errors.numero}</span>}
            {apiError && <span className={styles["erro"]}>{apiError}</span>}
            <div className={styles["contaU-salvar-wrapper"]}>
              <button type="submit" className={styles["btn-salvar"]} disabled={submitting}>{submitting ? "Salvando..." : "Salvar Alterações"}</button>
            </div>
          </form>
        </section>
        <div className={styles["contaU-grid"]}>
          <div className={`${styles["contaU-card"]} ${styles["contaU-access"]}`}>
            <h3>Conta de acesso</h3>
            <div className={styles["contaU-info"]}>
              <label htmlFor="email">E-mail:</label>
              <input type="email" id="email" defaultValue="housegreg@flig.com.br" />
              <button>Alterar</button>
            </div>
            <div className={styles["contaU-info"]}>
              <label htmlFor="senha">Senha:</label>
              <input type="password" id="senha" defaultValue="12345678" />
              <button>Alterar</button>
            </div>
          </div>
          <div className={`${styles["contaU-card"]} ${styles["contaU-delete"]}`}>
            <h3>Excluir conta</h3>
            <button className={styles["btn-delete"]}>🗑 Excluir conta</button>
            <p>Se você não deseja mais utilizar a Flig, pode solicitar a exclusão permanente de sua conta.</p>
          </div>
          <div className={`${styles["contaU-card"]} ${styles["contaU-sessions"]}`}>
            <h3>Encerrar sessões</h3>
            <button className={styles["btn-sair"]}>🔒 Encerrar Sessões</button>
            <p>Termine a sessão de forma segura em todos os dispositivos conectados.</p>
          </div>
          <div className={`${styles["contaU-card"]} ${styles["contaU-terms"]}`}>
            <h3>Termos de serviço</h3>
            <p>Ao utilizar a Flig, você concorda com nossos Termos de Serviço. Recomendamos a leitura para entender melhor suas responsabilidades e direitos ao usar a plataforma.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
