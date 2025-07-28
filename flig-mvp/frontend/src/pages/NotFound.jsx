import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <FiAlertCircle size={64} color="#e63946" />
      <h1>Página não encontrada (404)</h1>
      <p>Desculpe, não conseguimos encontrar a página que você procura.</p>
      <Link to="/" className={styles.link}>Voltar para a página inicial</Link>
    </div>
  );
} 