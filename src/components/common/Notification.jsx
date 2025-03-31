import React, { useEffect } from 'react';

const Notification = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const notificationStyles = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '15px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: '100',
    animation: 'slideIn 0.3s ease-out',
    borderLeft: `4px solid ${getBorderColor(type)}`,
  };

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: '10px',
  };

  function getBorderColor(type) {
    switch (type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--error)';
      case 'warning':
        return 'var(--warning)';
      default:
        return 'var(--accent)';
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div style={notificationStyles}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: getBorderColor(type),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}>
        {getIcon(type)}
      </div>
      <div>{message}</div>
      {onClose && (
        <button 
          style={closeButtonStyles} 
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;
