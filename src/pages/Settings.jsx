import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ManageMembers from '../components/settings/ManageMembers';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

const Settings = () => {
  const { currentTheme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { clearAll } = useNotifications();
  const navigate = useNavigate();
  
  const [currency, setCurrency] = useState('USD');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = () => {
    // In a real app, we would save these settings to the database
    // For now, we'll just show a success message
    alert('Settings saved successfully!');
  };
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearNotifications = async () => {
    try {
      await clearAll();
      alert('All notifications cleared!');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <div className="container">
      <h1>Settings</h1>
      
      {/* Manage Members - New section */}
      <div style={{ marginBottom: '20px' }}>
        <ManageMembers />
      </div>
      
      {/* Theme Settings */}
      <Card style={{ marginBottom: '20px' }}>
        <h3>Theme</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>App Theme</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              text="Light"
              variant={currentTheme === 'light' ? 'primary' : 'secondary'}
              onClick={() => setTheme('light')}
            />
            <Button
              text="Dark"
              variant={currentTheme === 'dark' ? 'primary' : 'secondary'}
              onClick={() => setTheme('dark')}
            />
            <Button
              text="System"
              variant={currentTheme === 'system' ? 'primary' : 'secondary'}
              onClick={() => setTheme('system')}
            />
          </div>
        </div>
      </Card>
      
      {/* Preferences */}
      <Card style={{ marginBottom: '20px' }}>
        <h3>Preferences</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Currency</label>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ 
              width: '100%',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid var(--bg-tertiary)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD ($)</option>
            <option value="AUD">AUD ($)</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Email Notifications
          </label>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Push Notifications
          </label>
        </div>
        
        <Button text="Save Preferences" onClick={handleSaveSettings} />
      </Card>
      
      {/* Account Actions */}
      <Card>
        <h3>Account</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <Button 
            text="Edit Profile" 
            onClick={() => navigate('/profile')}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <Button 
            text="Change Password" 
            variant="secondary"
            onClick={() => navigate('/forgot-password')}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <Button 
            text="Clear All Notifications" 
            variant="secondary"
            onClick={handleClearNotifications}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <Button 
            text={isLoading ? "Logging out..." : "Logout"}
            variant="danger"
            onClick={handleLogout}
            disabled={isLoading}
            style={{ width: '100%' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default Settings;
