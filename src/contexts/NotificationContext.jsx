import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import notificationsService from '../services/notifications';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchNotifications = async () => {
      try {
        const data = await notificationsService.getAll();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    
  }, [currentUser]);

  const markAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsService.delete(id);
      const updatedNotifications = notifications.filter(n => n.id !== id);
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationsService.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const addNotification = async (notification) => {
    try {
      const newNotification = await notificationsService.create(notification);
      setNotifications([newNotification, ...notifications]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      deleteNotification,
      clearAll,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
