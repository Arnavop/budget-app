import React from 'react';

const Card = ({ children, style }) => {
  const cardStyles = {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    ...style
  };

  return (
    <div style={cardStyles}>
      {children}
    </div>
  );
};

export default Card;
