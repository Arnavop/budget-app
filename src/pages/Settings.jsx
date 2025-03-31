import React from 'react';
import Card from '../components/common/Card';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const Settings = () => {
  const { currentUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const settingRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid var(--bg-tertiary)',
  };

  const settingLabelStyles = {
    fontSize: '16px',
  };

  const settingDescriptionStyles = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '5px',
  };

  const toggleSwitchStyles = {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '24px',
  };

  const toggleSliderStyles = {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: darkMode ? 'var(--accent)' : 'var(--bg-tertiary)',
    borderRadius: '24px',
    transition: '.4s',
  };

  const toggleSliderKnobStyles = {
    position: 'absolute',
    content: '""',
    height: '16px',
    width: '16px',
    left: darkMode ? '29px' : '4px',
    bottom: '4px',
    backgroundColor: 'var(--text-primary)',
    borderRadius: '50%',
    transition: '.4s',
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Settings</h1>
      
      <Card>
        <h2 style={{ marginBottom: '20px' }}>Appearance</h2>
        
        <div style={settingRowStyles}>
          <div>
            <div style={settingLabelStyles}>Dark Mode</div>
            <div style={settingDescriptionStyles}>
              Use dark theme throughout the application
            </div>
          </div>
          <div style={toggleSwitchStyles} onClick={toggleDarkMode}>
            <div style={toggleSliderStyles}>
              <div style={toggleSliderKnobStyles}></div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 style={{ marginBottom: '20px' }}>Account Settings</h2>
        
        <div style={settingRowStyles}>
          <div>
            <div style={settingLabelStyles}>Email</div>
            <div style={settingDescriptionStyles}>
              {currentUser?.email}
            </div>
          </div>
          <button 
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--accent-light)', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            Change
          </button>
        </div>
        
        <div style={settingRowStyles}>
          <div>
            <div style={settingLabelStyles}>Password</div>
            <div style={settingDescriptionStyles}>
              Last changed 30 days ago
            </div>
          </div>
          <button 
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--accent-light)', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            Change
          </button>
        </div>
      </Card>
      
      <Card>
        <h2 style={{ marginBottom: '20px' }}>Notifications</h2>
        
        <div style={settingRowStyles}>
          <div>
            <div style={settingLabelStyles}>Email Notifications</div>
            <div style={settingDescriptionStyles}>
              Receive email alerts for new expenses and settlements
            </div>
          </div>
          <div style={toggleSwitchStyles}>
            <div style={{...toggleSliderStyles, backgroundColor: 'var(--accent)'}}>
              <div style={{...toggleSliderKnobStyles, left: '29px'}}></div>
            </div>
          </div>
        </div>
        
        <div style={settingRowStyles}>
          <div>
            <div style={settingLabelStyles}>Push Notifications</div>
            <div style={settingDescriptionStyles}>
              Receive push notifications on your device
            </div>
          </div>
          <div style={toggleSwitchStyles}>
            <div style={{...toggleSliderStyles, backgroundColor: 'var(--bg-tertiary)'}}>
              <div style={{...toggleSliderKnobStyles, left: '4px'}}></div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 style={{ color: 'var(--error)' }}>Danger Zone</h2>
        
        <div style={{ marginTop: '15px' }}>
          <button 
            style={{ 
              backgroundColor: 'var(--error)', 
              color: 'white', 
              border: 'none', 
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer' 
            }}
          >
            Delete Account
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
