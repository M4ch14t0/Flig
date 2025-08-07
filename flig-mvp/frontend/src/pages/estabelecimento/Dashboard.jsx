import React from 'react';
import { FiBarChart2, FiUsers, FiClock, FiTrendingUp, FiHome, FiList, FiCreditCard } from 'react-icons/fi';
import Layout from '../../components/Layout';

const sidebarLinks = [
  { to: '/estabelecimento/home', label: 'Home', icon: <FiHome /> },
  { to: '/estabelecimento/dashboard', label: 'Dashboard', icon: <FiBarChart2 />, active: true },
  { to: '/estabelecimento/gerenciar-filas', label: 'Gerenciar Filas', icon: <FiList /> },
  { to: '/estabelecimento/planos', label: 'Planos', icon: <FiCreditCard /> },
];

export default function Dashboard() {
  return (
    <Layout sidebarLinks={sidebarLinks} userType="estabelecimento">
      <div style={{ display: 'flex', gap: '2rem', marginBottom: 32 }}>
        <div style={{ background: '#f5f7fa', borderRadius: 12, padding: 24, minWidth: 200 }}>
          <FiUsers size={32} />
          <h2>Atendimentos</h2>
          <p style={{ fontSize: 24, fontWeight: 700 }}>--</p>
        </div>
        <div style={{ background: '#f5f7fa', borderRadius: 12, padding: 24, minWidth: 200 }}>
          <FiClock size={32} />
          <h2>Tempo Médio</h2>
          <p style={{ fontSize: 24, fontWeight: 700 }}>-- min</p>
        </div>
        <div style={{ background: '#f5f7fa', borderRadius: 12, padding: 24, minWidth: 200 }}>
          <FiTrendingUp size={32} />
          <h2>Avanços Pagos</h2>
          <p style={{ fontSize: 24, fontWeight: 700 }}>--</p>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minHeight: 300 }}>
        <h2>Gráficos e Relatórios</h2>
        <p>Em breve: gráficos de atendimentos, abandonos, avanços pagos, etc.</p>
      </div>
    </Layout>
  );
} 