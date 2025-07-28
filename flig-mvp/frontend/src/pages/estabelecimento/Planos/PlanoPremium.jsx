import React from 'react';
import { FiStar } from 'react-icons/fi';
import styles from './PlanoPremium.module.css';

export default function PlanoPremium() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}><FiStar /> Plano Premium</h1>
      <div className={styles.card}>
        <h2>Recursos Premium:</h2>
        <ul>
          <li>✔ Filas ilimitadas</li>
          <li>✔ Estatísticas avançadas</li>
          <li>✔ Exportação CSV</li>
          <li>✔ Backup automático</li>
          <li>✔ Suporte prioritário</li>
        </ul>
        <p>Para estabelecimentos que querem o máximo controle e performance.</p>
      </div>
    </div>
  );
} 