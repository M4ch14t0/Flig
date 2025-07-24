import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PagamentoE.module.css';

function PagamentoEstab() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    razaoSocial: '',
    cnpj: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    nomeCartao: '',
    numeroCartao: '',
    validade: '',
    cvv: '',
    plano: 'Essencial',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buscarEndereco = async () => {
    if (form.cep.length < 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${form.cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({ ...prev, endereco: data.logradouro }));
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo}>Flig</div>
        <div className={styles.headerRight}>
          <Link to="/faq" className={styles.helpIcon}>❓</Link>
          <div className={styles.userIconWrapper}>
            <button className={styles.userIcon}>👤</button>
            <div className={styles.userPopup}>
              <p>👤 <u>Perfil</u></p>
              <p>⚙️ <u>Configurações</u></p>
              <p>🔓 <u>Sair</u></p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.pageTitle}>
          <button className={styles.backBtn} onClick={() => navigate('/planos')}>←</button>
          Pagamento:
        </h2>

        <div className={styles.formContainer}>
          {/* Coluna da Esquerda */}
          <div className={styles.leftColumn}>
            <section className={styles.sectionBox}>
              <h3>Dados da Empresa</h3>
              <input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} placeholder="Razão Social..." />
              <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="CNPJ..." />
              <input name="email" value={form.email} onChange={handleChange} placeholder="E-mail..." />
              <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone..." />
            </section>

            <section className={styles.sectionBox}>
              <h3>Endereço de Cobrança</h3>
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                onBlur={buscarEndereco}
                placeholder="CEP..."
              />
              <div className={styles.cardLine}>
                <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço..." />
                <input name="numero" value={form.numero} onChange={handleChange} placeholder="Nº" />
              </div>
            </section>

            <section className={styles.sectionBox}>
              <h3>Dados de Pagamento:</h3>
              <select name="formaPagamento" onChange={handleChange}>
                <option>Cartão de Crédito</option>
              </select>
              <input name="nomeCartao" value={form.nomeCartao} onChange={handleChange} placeholder="Nome impresso no cartão" />
              <div className={styles.cardLine}>
                <input name="numeroCartao" value={form.numeroCartao} onChange={handleChange} placeholder="Número do Cartão" />
                <input type="month" name="validade" value={form.validade} onChange={handleChange} placeholder="Validade" />
                <input name="cvv" value={form.cvv} onChange={handleChange} placeholder="CVV" />
              </div>
              <div className={styles.bandeiras}>
                <img src="/img/mastercard.png" alt="mastercard" />
                <img src="/img/elo.png" alt="elo" />
                <img src="/img/visa.png" alt="visa" />
                <img src="/img/amex.png" alt="amex" />
                <img src="/img/hipercard.png" alt="hipercard" />
              </div>
            </section>
          </div>

          {/* Caixa Direita usando sectionBox */}
          <section className={styles.sectionBox}>
            <div className={styles.paymentDetails}>
              <h3>Plano {form.plano}</h3>
              <p><strong>Valor do produto:</strong> R$ 39,90</p>
              <p><strong>Desconto:</strong> R$ 0,00</p>
              <hr />
              <p><strong>Total a pagar:</strong> R$ 39,90</p>
              <small>Os dados de pagamentos enviados são protegidos de acordo com a <a href="#">LGPD</a>.</small>
            </div>

            <div className={styles.checkboxes}>
              <label>
                <input type="checkbox" />
                Li e concordo com a <a href="#">Política de Privacidade</a>.
              </label>
              <label>
                <input type="checkbox" />
                Li e concordo com os <a href="#">termos de serviço</a>.
              </label>
            </div>

            <button className={styles.confirmBtn}>Confirmar Pagamento</button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PagamentoEstab;
