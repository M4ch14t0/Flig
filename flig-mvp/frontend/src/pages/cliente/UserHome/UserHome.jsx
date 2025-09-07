import React from 'react';
import Layout from '../../../components/Layout';
import { Home, MapPin, List } from 'lucide-react';
import styles from './UserHome.module.css';

export default function UserHome() {
  const sidebarLinks = [
    {
      to: '/cliente/home',
      label: 'Home',
      icon: <Home size={16} />,
      active: true
    },
    {
      to: '/cliente/estabelecimentos',
      label: 'Estabelecimentos',
      icon: <MapPin size={16} />
    },
    {
      to: '/cliente/minhas-filas',
      label: 'Minhas Filas',
      icon: <List size={16} />
    }
  ];

  return (
    <Layout
      sidebarLinks={sidebarLinks}
      userType="cliente"
      showFooter={false}
    >
      <div className={styles.welcomeContainer}>
        <h1 className={styles.welcomeTitle}>
          Bem-vindo a <strong>Flig</strong>
        </h1>
        <p className={styles.welcomeSubtitle}>
          Encontre estabelecimentos e gerencie suas filas de forma inteligente
        </p>
      </div>
    </Layout>
  );
}
