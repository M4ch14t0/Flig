import React from 'react';
import { FiUsers, FiClock, FiArrowUpCircle, FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Home, BarChart2, List, CreditCard } from 'lucide-react';
import styles from './DetalhesFila.module.css';

export default function DetalhesFila() {
  const navigate = useNavigate();

  const sidebarLinks = [
    { to: '/estabelecimento/home', label: 'Home', icon: <Home size={16} /> },
    { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <List size={16} />, active: true },
    { to: '/estabelecimento/planos', label: 'Planos', icon: <CreditCard size={16} /> },
  ];

  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento" showFooter={false}>
      <div className={styles.wrapper}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}><FiChevronLeft /> Voltar</button>
        <h1 className={styles.title}><FiUsers /> Detalhes da Fila</h1>
        <div className={styles.cards}>
          <div className={styles.card}>
            <FiClock size={28} />
            <h2>Tempo Médio</h2>
            <p>-- min</p>
          </div>
          <div className={styles.card}>
            <FiArrowUpCircle size={28} />
            <h2>Avanços Pagos</h2>
            <p>--</p>
          </div>
        </div>
        <div className={styles.main}>
          <h2>Participantes</h2>
          <p>Em breve: lista de participantes, posição, tempo de espera, etc.</p>
        </div>
      </div>
    </Layout>
  );
}
