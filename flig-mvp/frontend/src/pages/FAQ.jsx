import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import styles from './FAQ.module.css';

export default function FAQ() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}><FiHelpCircle /> Perguntas Frequentes (FAQ)</h1>
      <div className={styles.section}>
        <h2>Como funciona a Flig?</h2>
        <p>Flig é uma plataforma de filas virtuais para clientes e estabelecimentos. Você pode entrar em filas remotamente, acompanhar sua posição e até pagar para avançar.</p>
        <h2>Como entro em uma fila?</h2>
        <p>Basta acessar a lista de estabelecimentos, escolher um e clicar em "Entrar na fila".</p>
        <h2>O que é o avanço pago?</h2>
        <p>É a possibilidade de pagar para avançar algumas posições na fila, disponível em estabelecimentos que ativam essa função.</p>
        <h2>Como faço o pagamento?</h2>
        <p>Você pode pagar com cartão de crédito diretamente pelo app ou web.</p>
        <h2>Como um estabelecimento pode usar a Flig?</h2>
        <p>Empresas podem se cadastrar, criar filas, acompanhar estatísticas e gerenciar atendimentos pelo painel web.</p>
        <h2>Preciso baixar algum app?</h2>
        <p>Usuários podem usar o app (em breve) ou acessar pelo navegador. Estabelecimentos usam o painel web.</p>
      </div>
    </div>
  );
} 