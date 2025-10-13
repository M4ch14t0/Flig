import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import styles from './NotificationPopup.module.css';

const NotificationPopup = ({ message, isVisible, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      
      // Animar a barra de progresso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - (100 / 30); // 3 segundos = 30 frames a 10fps
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.notification}>
        <div className={styles.notificationHeader}>
          <div className={styles.notificationIcon}>
            <FiCheckCircle size={20} />
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar notificação"
          >
            <FiX size={16} />
          </button>
        </div>
        
        <div className={styles.notificationContent}>
          <p className={styles.notificationMessage}>{message}</p>
        </div>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;

