import { useNavigate, Link } from "react-router-dom";
import { HelpCircle, User, Settings } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import styles from './ContaE.module.css';

function validateCNPJ(cnpj) {
  return /^\d{14}$/.test(cnpj.replace(/\D/g, ""));
}

export default function ContaE() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    razao: '',
    cnpj: '',
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
    if (!form.razao) newErrors.razao = "Razão Social obrigatória";
    if (!form.cnpj) newErrors.cnpj = "CNPJ obrigatório";
    else if (!validateCNPJ(form.cnpj)) newErrors.cnpj = "CNPJ inválido (apenas números)";
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
    <div className={styles["contaE-container"]}>
      <header className={styles["contaE-header"]}>
        <img src="/logo-flig.svg" alt="Logo Flig" className={styles["contaE-logo"]} />
        <div className={styles["contaE-icons"]}>
          <button onClick={() => navigate("/faq") }><HelpCircle /></button>
          <button onClick={() => navigate("/estabelecimento/perfil") }><User /></button>
          <button type="button" onClick={() => navigate("/estabelecimento/configuracoes") }><Settings /></button>
        </div>
      </header>
      <main className={styles["contaE-main"]}>
        <section className={styles["contaE-form-box"]}>
          <button className={styles["contaE-back"]} onClick={() => navigate("/estabelecimento/home") }>
            <ArrowLeft size={18} /> Voltar
          </button>
          <h2>Dados da Empresa</h2>
          <div className={styles["contaE-form-wrapper"]}>
            <form className={styles["contaE-form"]} onSubmit={handleSubmit} noValidate>
              <input name="razao" type="text" placeholder="Razão Social:" value={form.razao} onChange={handleChange} />
              {errors.razao && <span className={styles["erro"]}>{errors.razao}</span>}
              <input name="cnpj" type="text" placeholder="CNPJ:" value={form.cnpj} onChange={handleChange} />
              {errors.cnpj && <span className={styles["erro"]}>{errors.cnpj}</span>}
              <input name="telefone" type="text" placeholder="Telefone:" value={form.telefone} onChange={handleChange} />
              {errors.telefone && <span className={styles["erro"]}>{errors.telefone}</span>}
              <input name="cep" type="text" placeholder="CEP:" value={form.cep} onChange={handleChange} />
              {errors.cep && <span className={styles["erro"]}>{errors.cep}</span>}
              <div className={styles["contaE-row"]}>
                <input name="endereco" type="text" placeholder="Endereço:" className={styles["input-longo"]} value={form.endereco} onChange={handleChange} />
                <input name="numero" type="text" placeholder="Nº:" className={styles["input-curto"]} value={form.numero} onChange={handleChange} />
              </div>
              {errors.endereco && <span className={styles["erro"]}>{errors.endereco}</span>}
              {errors.numero && <span className={styles["erro"]}>{errors.numero}</span>}
              {apiError && <span className={styles["erro"]}>{apiError}</span>}
              <div className={styles["contaE-salvar-wrapper"]}>
                <button type="submit" className={styles["btn-salvar"]} disabled={submitting}>{submitting ? "Salvando..." : "Salvar Alterações"}</button>
              </div>
            </form>
            <div className={styles["contaE-avatar"]}>
              <img src="/avatar-placeholder.png" alt="Avatar" />
              <button className={styles["btn-editar-avatar"]}>Editar Imagem de Perfil</button>
            </div>
          </div>
        </section>
        <div className={styles["contaE-grid"]}>
          <div className={styles["contaE-card"]}>
            <h3>Conta e Acesso</h3>
            <div className={styles["contaE-info"]}>
              <label htmlFor="email">E-mail:</label>
              <input type="email" id="email" defaultValue="housemage@flig.com.br" />
              <button>Alterar</button>
            </div>
            <div className={styles["contaE-info"]}>
              <label htmlFor="senha">Senha:</label>
              <input type="password" id="senha" defaultValue="12345678" />
              <button>Alterar</button>
            </div>
          </div>
          <div className={styles["contaE-card"]}>
            <h3>Plano da Empresa</h3>
            <p>Plano: <strong>Profissional</strong> (ativo)</p>
            <p>Válido até: <strong>16/09/2025</strong></p>
          </div>
          <div className={styles["contaE-card"]}>
            <h3>Encerrar Sessões</h3>
            <button className={styles["btn-sair"]}>🔒 Encerrar Sessões</button>
            <p>Termine a sessão de forma segura em todos os dispositivos conectados.</p>
          </div>
          <div className={styles["contaE-card"]}>
            <h3>Excluir Conta</h3>
            <button className={styles["btn-delete"]}>🗑 Excluir conta</button>
            <p>Se você não deseja mais utilizar a Flig, pode solicitar a exclusão permanente de sua conta.</p>
          </div>
        </div>
        <footer className={styles["contaE-footer"]}>
          <p>Ao utilizar a Flig, você concorda com nossos <strong>Termos de Serviço</strong>.</p>
        </footer>
      </main>
    </div>
  );
}
