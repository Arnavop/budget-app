import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
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
          <h1 style={{ margin: '0' }}>Split.io</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: 'rgba(207, 102, 121, 0.1)',
            color: 'var(--error)',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link 
              to="/forgot-password"
              style={{ 
                color: 'var(--accent-light)', 
                textDecoration: 'none', 
                fontSize: '14px' 
              }}
            >
              Forgot password?
            </Link>
          </div>
          
          <Button 
            text={loading ? 'Signing in...' : 'Sign In'} 
            type="submit"
            disabled={loading}
            style={{ width: '100%' }}
          />
        </form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          color: 'var(--text-secondary)',
          fontSize: '14px', 
        }}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={{ color: 'var(--accent-light)', textDecoration: 'none' }}
          >
            Sign Up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
