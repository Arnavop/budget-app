import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // Add a short timeout for initial loading state to prevent flickering
  const [showLoading, setShowLoading] = React.useState(false);
  
  useEffect(() => {
    // Only show loading indicator if loading takes more than 300ms
    const timer = setTimeout(() => {
      if (loading) {
        setShowLoading(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // If we're still loading authentication state and don't have immediate access to localStorage data
  if (loading) {
    // Only show loading UI if it's been a while
    if (!showLoading) {
      return null; // Return empty to prevent layout shift
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

  // Redirect to login if not authenticated
  if (!currentUser) {
    // Remember where the user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
