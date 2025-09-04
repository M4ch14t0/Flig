import React from 'react';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard } from 'lucide-react';
import styles from './PlanoGratuito.module.css';

export default function PlanoGratuito() {
  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} /> },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} />, active: true },
  ];

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}> Plano Gratuito</h1>
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
    </Layout>
  );
}
