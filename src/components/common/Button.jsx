import React from 'react';

const Button = ({ 
  children, 
  text, 
  onClick, 
  style, 
  variant = 'primary',
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = {
    cursor: 'pointer',
    borderRadius: '4px',
    border: 'none',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: 'var(--accent-light)',
          textAlign: 'left',
          padding: '5px',
        };
      case 'icon':
        return {
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0',
          backgroundColor: 'var(--accent)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          padding: '10px 12px',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--accent)',
          color: 'var(--text-primary)',
          padding: '10px 12px',
        };
    }
  };

  const getHoverStyles = () => {
    if (disabled) return {};
    
    switch (variant) {
      case 'text':
        return {
          backgroundColor: 'rgba(187, 134, 252, 0.1)',
        };
      case 'icon':
      case 'primary':
        return {
          backgroundColor: 'var(--accent-light)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-secondary)',
        };
      default:
        return {};
    }
  };

  const buttonStyles = {
    ...baseStyles,
    ...getVariantStyles(),
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  };

  return (
    <button 
      type={type}
      style={buttonStyles}
      onClick={disabled ? undefined : onClick}
      onMouseOver={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, getHoverStyles());
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, getVariantStyles());
        }
      }}
      disabled={disabled}
    >
      {children || text}
    </button>
  );
};

export default Button;
