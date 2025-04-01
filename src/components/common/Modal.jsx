import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, style }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalStyles = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '1000',
    ...style
  };

  const modalContentStyles = {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    padding: '20px',
    position: 'relative',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const modalHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const modalTitleStyles = {
    fontSize: '18px',
    fontWeight: 'bold',
  };

  const modalCloseStyles = {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '20px',
    width: 'auto',
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={modalStyles} onClick={handleBackdropClick}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyles}>
          <div style={modalTitleStyles}>{title}</div>
          <button 
            style={modalCloseStyles} 
            onClick={onClose}
            onMouseOver={(e) => { e.target.style.color = 'var(--text-primary)' }}
            onMouseOut={(e) => { e.target.style.color = 'var(--text-secondary)' }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
