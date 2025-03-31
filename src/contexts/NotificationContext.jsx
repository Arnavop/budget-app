import React, { createContext, useState, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      ...notification,
      id,
      read: false,
      timestamp: new Date()
    };
    setNotifications([newNotification, ...notifications]);

    // Auto remove after 5 seconds if it's a toast
    if (notification.type === 'toast') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
