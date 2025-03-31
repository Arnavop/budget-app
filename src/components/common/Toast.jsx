import React from 'react';
import Notification from './Notification';
import { useNotifications } from '../../hooks/useNotifications';

const Toast = () => {
  const { notifications, removeNotification } = useNotifications();
  
  // Only display toast-type notifications
  const toasts = notifications.filter(n => n.type === 'toast');
  
  if (toasts.length === 0) return null;
  
  // Only show the most recent toast
  const toast = toasts[0];
  
  return (
    <Notification
      message={toast.message}
      type={toast.severity || 'info'}
      duration={toast.duration || 5000}
      onClose={() => removeNotification(toast.id)}
    />
  );
};

export default Toast;
