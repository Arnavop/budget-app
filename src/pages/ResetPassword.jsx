import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { auth } from '../services/auth';
import { supabase } from '../supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the access token from the URL (Supabase adds this automatically)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      // Set the access token in Supabase
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token'),
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Passwords don't match");
      setIsError(true);
      return;
    }
    
    setLoading(true);
    setMessage('');
    setIsError(false);
    
    try {
      await auth.updatePassword(password);
      setMessage('Password updated successfully! Redirecting to login...');
      setIsError(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Password update error:', error);
      setMessage('Failed to update password. Please try again or request a new reset link.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>💸</div>
          <h1 style={{ margin: '0' }}>Create New Password</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter your new password below
          </p>
        </div>
        
        {message && (
          <div style={{
            backgroundColor: isError ? 'rgba(207, 102, 121, 0.1)' : 'rgba(102, 207, 121, 0.1)',
            color: isError ? 'var(--error)' : 'var(--success)',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <Button 
            text={loading ? 'Updating...' : 'Update Password'} 
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          />
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;