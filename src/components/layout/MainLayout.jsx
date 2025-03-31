import React from 'react';
import Header from './Header';

const MainLayout = ({ children }) => {
  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  };

  return (
    <div style={containerStyles}>
      <Header />
      {children}
    </div>
  );
};

export default MainLayout;
