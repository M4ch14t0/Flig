import React, { useState } from 'react';
import { FiHome, FiMapPin, FiUsers, FiCreditCard } from 'react-icons/fi';
import Layout from '../../../components/Layout';

const sidebarLinks = [
  { to: '/cliente/home', label: 'Home', icon: <FiHome /> },
  { to: '/cliente/estabelecimentos', label: 'Estabelecimentos', icon: <FiMapPin /> },
  { to: '/cliente/minhas-filas', label: 'Minhas Filas', icon: <FiUsers /> },
  { to: '/cliente/pagamento', label: 'Pagamento', icon: <FiCreditCard />, active: true },
];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateCPF(cpf) {
  return /^\d{11}$/.test(cpf.replace(/\D/g, ''));
}

function Pagamento() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    valor: '10,00',
    status: 'pendente',
  });
  const [pagou, setPagou] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  function validate() {
    const newErrors = {};
    if (!form.nome) newErrors.nome = 'Nome obrigatório';
    if (!form.email) newErrors.email = 'E-mail obrigatório';
    else if (!validateEmail(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.cpf) newErrors.cpf = 'CPF obrigatório';
    else if (!validateCPF(form.cpf)) newErrors.cpf = 'CPF inválido (apenas números)';
    return newErrors;
  }

  const handlePagar = (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setForm((prev) => ({ ...prev, status: 'aprovado' }));
      setPagou(true);
      setSubmitting(false);
    }, 1000);
  };

  return (
    <Layout sidebarLinks={sidebarLinks} userType="cliente">
      <div style={{ maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32 }}>
        <h2 style={{ marginBottom: 24 }}>Pagamento (Simulação PagSeguro)</h2>
        {pagou ? (
          <div style={{ textAlign: 'center', color: 'green' }}>
            <img src="https://stc.pagseguro.uol.com.br/public/img/botoes/pagamentos/120x53-pagar.gif" alt="PagSeguro" style={{ marginBottom: 16 }} />
            <h3>Pagamento aprovado!</h3>
            <p>Obrigado por utilizar a Flig.</p>
          </div>
        ) : (
          <form onSubmit={handlePagar} noValidate>
            <label htmlFor="nome">Nome:</label>
            <input id="nome" name="nome" value={form.nome} onChange={handleChange} required style={{ width: '100%', marginBottom: 4 }} />
            {errors.nome && <span style={{ color: 'red', fontSize: 12 }}>{errors.nome}</span>}
            <label htmlFor="email">E-mail:</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', marginBottom: 4 }} />
            {errors.email && <span style={{ color: 'red', fontSize: 12 }}>{errors.email}</span>}
            <label htmlFor="cpf">CPF:</label>
            <input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} required style={{ width: '100%', marginBottom: 4 }} />
            {errors.cpf && <span style={{ color: 'red', fontSize: 12 }}>{errors.cpf}</span>}
            <label htmlFor="valor">Valor:</label>
            <input id="valor" name="valor" value={form.valor} disabled style={{ width: '100%', marginBottom: 12 }} />
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <img src="https://stc.pagseguro.uol.com.br/public/img/botoes/pagamentos/120x53-pagar.gif" alt="PagSeguro" />
            </div>
            <button type="submit" style={{ width: '100%', background: '#10c86e', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontWeight: 600, fontSize: 16, cursor: 'pointer' }} disabled={submitting}>
              {submitting ? 'Processando...' : 'Pagar com PagSeguro (Simulação)'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default Pagamento;
