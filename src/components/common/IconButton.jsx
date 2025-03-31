import React from 'react';

const IconButton = ({ icon, onClick, style }) => {
  const iconButtonStyles = {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    backgroundColor: 'var(--accent)',
    cursor: 'pointer',
    borderRadius: '4px',
    border: 'none',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    ...style
  };

  return (
    <button 
      style={iconButtonStyles} 
      onClick={onClick}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = 'var(--accent-light)';
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = 'var(--accent)';
      }}
    >
      {icon}
    </button>
  );
};

export default IconButton;
