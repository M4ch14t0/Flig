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
          Bem-vindo a 
        </h1>
        <img 
          src="/assets/logos/flig-logo.png" 
          alt="Flig" 
          className={styles.logo}
          onError={(e) => {
            console.error('Erro ao carregar logo:', e.target.src);
            e.target.src = '/assets/logos/flig-logo.svg';
          }}
        />
      </div>
    </Layout>
  );
}
