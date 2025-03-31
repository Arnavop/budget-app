import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const MainLayout = () => {
  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  };

  return (
    <div style={containerStyles}>
      <Header />
      <Outlet />
    </div>
  );
};

export default MainLayout;
