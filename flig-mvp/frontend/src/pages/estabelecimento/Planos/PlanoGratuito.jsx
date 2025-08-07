import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import styles from './PlanoGratuito.module.css';

export default function PlanoGratuito() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}><FiCheckCircle /> Plano Gratuito</h1>
      <div className={styles.card}>
        <h2>Recursos:</h2>
        <ul>
          <li>✔ 1 fila ativa</li>
          <li>✔ Até 100 atendimentos/mês</li>
          <li>✔ Painel básico</li>
          <li>✔ Suporte por e-mail</li>
        </ul>
        <p>Ideal para pequenos negócios testarem a Flig sem custo.</p>
      </div>
    </div>
  );
} 