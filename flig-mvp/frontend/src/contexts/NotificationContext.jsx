import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationPopup from '../components/NotificationPopup';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      isVisible: true,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove após 3 segundos
    setTimeout(() => {
      hideNotification(id);
    }, 3000);

    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const showClientCalled = useCallback((clientName) => {
    return showNotification(`Cliente ${clientName} foi chamado!`, {
      type: 'success'
    });
  }, [showNotification]);

  const value = {
    showNotification,
    hideNotification,
    showClientCalled
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.map(notification => (
        <NotificationPopup
          key={notification.id}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

