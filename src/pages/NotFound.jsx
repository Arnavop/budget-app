import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ fontSize: '72px', marginBottom: '20px' }}>404</div>
      <h1 style={{ marginBottom: '20px' }}>Page Not Found</h1>
      <p style={{ 
        color: 'var(--text-secondary)',
        maxWidth: '500px',
        marginBottom: '30px'
      }}>
        Sorry, we couldn't find the page you're looking for. The page might have been removed,
        renamed, or is temporarily unavailable.
      </p>
      <Button 
        text="Back to Dashboard" 
        onClick={() => navigate('/')}
      />
    </div>
  );
};

export default NotFound;
