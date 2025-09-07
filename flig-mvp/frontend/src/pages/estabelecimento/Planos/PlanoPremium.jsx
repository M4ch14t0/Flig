import React from 'react';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard } from 'lucide-react';
import styles from './PlanoPremium.module.css';

export default function PlanoPremium() {
  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} /> },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} />, active: true },
  ];

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}> Plano Premium</h1>
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
    </Layout>
  );
}
