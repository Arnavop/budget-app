import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }
    
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account');
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
          <p style={{ color: 'var(--text-secondary)' }}>Create your account</p>
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
            type="text"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
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
          
          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <Button 
            text={loading ? 'Creating Account...' : 'Sign Up'} 
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          />
        </form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          color: 'var(--text-secondary)',
          fontSize: '14px', 
        }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{ color: 'var(--accent-light)', textDecoration: 'none' }}
          >
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
