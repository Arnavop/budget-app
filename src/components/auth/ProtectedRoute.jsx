import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom'; //use location contains pathname, search, hash, state
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  const [showLoading, setShowLoading] = React.useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowLoading(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    if (!showLoading) {
      return null;
    }
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>💸</div>
            <p>Loading your account...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
