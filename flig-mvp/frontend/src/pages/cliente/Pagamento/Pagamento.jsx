import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Pagamento.module.css';

function Pagamento() {
  const [form, setForm] = useState({
    nome: '',
    nomeSocial: '',
    email: '',
    telefone: '',
    cpf: '',
    formaPagamento: 'Cartão de Crédito',
    nomeCartao: '',
    numeroCartao: '',
    validade: '',
    cvv: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        <h2 className={styles.pageTitle}>← Pagamento:</h2>

        <div className={styles.formContainer}>
          {/* Coluna da Esquerda */}
          <div className={styles.leftColumn}>
            <section className={styles.sectionBox}>
              <h3>Seus Dados:</h3>
              <input name="nome" placeholder="Nome Completo..." value={form.nome} onChange={handleChange} />
              <input name="nomeSocial" placeholder="Nome Comercial..." value={form.nomeSocial} onChange={handleChange} />
              <input name="email" placeholder="Email utilizado..." value={form.email} onChange={handleChange} />
              <input name="telefone" placeholder="Número de telefone..." value={form.telefone} onChange={handleChange} />
              <input name="cpf" placeholder="CPF..." value={form.cpf} onChange={handleChange} />
            </section>

            <section className={styles.sectionBox}>
              <h3>Dados de Pagamento:</h3>
              <select name="formaPagamento" value={form.formaPagamento} onChange={handleChange}>
                <option>Cartão de Crédito</option>
              </select>
              <input name="nomeCartao" placeholder="Nome impresso no cartão" value={form.nomeCartao} onChange={handleChange} />
              <div className={styles.cardLine}>
                <input name="numeroCartao" placeholder="Número do Cartão" value={form.numeroCartao} onChange={handleChange} />
                <input type="month" name="validade" placeholder="MM/AAAA" value={form.validade} onChange={handleChange} />
                <input name="cvv" placeholder="000" value={form.cvv} onChange={handleChange} />
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

          {/* Coluna da Direita */}
          <div className={styles.rightColumn}>
            <div className={styles.paymentDetails}>
              <h3>3 Avanços</h3>
              <p><strong>Valor do produto:</strong> R$ 24,90</p>
              <p><strong>Desconto:</strong> R$ 0,00</p>
              <hr />
              <p><strong>Total a pagar:</strong> R$ 24,90</p>
              <small>Os dados de pagamentos enviados são protegidos de acordo com a <a href="#">LGPD</a>.</small>
            </div>

            <div className={styles.checkboxes}>
              <label><input type="checkbox" /> Li e concordo com a <a href="#">Política de Privacidade</a>.</label>
              <label><input type="checkbox" /> Li e concordo com os <a href="#">termos de serviço</a>.</label>
            </div>

            <button className={styles.confirmBtn}>Confirmar Pagamento</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Pagamento;
