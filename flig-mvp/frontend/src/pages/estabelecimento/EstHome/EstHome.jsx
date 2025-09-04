import React from 'react';
import Layout from '../../../components/Layout';
import { Home, List, CreditCard } from 'lucide-react';
import styles from './EstHome.module.css';

export default function EstHome() {
  const sidebarLinks = [
    {
      to: '/estabelecimento/home',
      label: 'Home',
      icon: <Home size={16} />,
      active: true
    },
    {
      to: '/estabelecimento/dashboard',
      label: 'Dashboard',
      icon: <Home size={16} />
    },
    {
      to: '/estabelecimento/gerenciar-filas',
      label: 'Gerenciar Filas',
      icon: <List size={16} />
    },
    {
      to: '/estabelecimento/planos',
      label: 'Planos',
      icon: <CreditCard size={16} />
    }
  ];

  return (
    <Layout
      sidebarLinks={sidebarLinks}
      userType="estabelecimento"
      showFooter={false}
    >
      <div className={styles.welcomeContainer}>
        <h1 className={styles.welcomeTitle}>
          Bem-vindo a <strong>Flig</strong>
        </h1>
        <p className={styles.welcomeSubtitle}>
          Gerencie suas filas e otimize a experiência dos seus clientes
        </p>
      </div>
    </Layout>
  );
}
