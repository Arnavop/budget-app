import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { auth } from '../services/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    
    try {
      await auth.resetPassword(email);
      setMessage('Check your email for password reset instructions.');
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage('Failed to send reset instructions. Please try again.');
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
          <h1 style={{ margin: '0' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter your email and we'll send you instructions to reset your password
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
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
          
          <Button 
            text={loading ? 'Sending...' : 'Send Reset Instructions'} 
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          />
        </form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          color: 'var(--text-secondary)',
          fontSize: '14px', 
        }}>
          Remember your password?{' '}
          <Link 
            to="/login" 
            style={{ color: 'var(--accent-light)', textDecoration: 'none' }}
          >
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;