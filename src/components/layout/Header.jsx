import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid var(--bg-tertiary)',
    marginBottom: '20px',
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--accent-light)',
  };

  const logoIconStyles = {
    fontSize: '28px',
  };

  const navStyles = {
    display: 'flex',
    gap: '20px',
  };

  const navItemStyles = (isActive) => ({
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'all 0.2s',
    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
  });

  const profileDropdownStyles = {
    position: 'relative',
    marginLeft: '20px',
  };

  const profileButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '20px',
    backgroundColor: 'var(--bg-tertiary)',
  };

  const profileAvatarStyles = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  };

  const dropdownContentStyles = {
    display: showDropdown ? 'block' : 'none',
    position: 'absolute',
    right: '0',
    top: '45px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    minWidth: '200px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: '10',
  };

  const dropdownItemStyles = {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const dropdownDividerStyles = {
    height: '1px',
    backgroundColor: 'var(--bg-tertiary)',
    margin: '5px 0',
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    if (page === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${page}`);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  return (
    <header style={headerStyles}>
      <div style={logoStyles}>
        <span style={logoIconStyles}>💸</span>
        <span>Split.io</span>
      </div>
      
      <nav style={navStyles}>
        <div 
          style={navItemStyles(activePage === 'dashboard')} 
          onClick={() => handleNavClick('dashboard')}
        >
          Dashboard
        </div>
        <div 
          style={navItemStyles(activePage === 'groups')} 
          onClick={() => handleNavClick('groups')}
        >
          Groups
        </div>
        <div 
          style={navItemStyles(activePage === 'history')} 
          onClick={() => handleNavClick('history')}
        >
          History
        </div>
        <div 
          style={navItemStyles(activePage === 'analytics')} 
          onClick={() => handleNavClick('analytics')}
        >
          Analytics
        </div>
        <div 
          style={navItemStyles(activePage === 'receipts')} 
          onClick={() => handleNavClick('receipts')}
        >
          Receipts
        </div>
        <div 
          style={navItemStyles(activePage === 'settings')} 
          onClick={() => handleNavClick('settings')}
        >
          Settings
        </div>
      </nav>
      
      <div style={profileDropdownStyles}>
        <div style={profileButtonStyles} onClick={handleProfileClick}>
          <div style={profileAvatarStyles}>{currentUser?.avatar}</div>
          <span>{currentUser?.name}</span>
        </div>
        <div style={dropdownContentStyles}>
          <div style={dropdownItemStyles} onClick={() => {
            navigate('/profile');
            setShowDropdown(false);
          }}>
            <div style={profileAvatarStyles}>{currentUser?.avatar}</div>
            <div>Your Profile</div>
          </div>
          <div style={dropdownDividerStyles}></div>
          <div style={dropdownItemStyles}>
            <span>🔔</span>
            <div>Notifications</div>
          </div>
          <div style={dropdownItemStyles}>
            <span>🌙</span>
            <div>Dark Mode</div>
          </div>
          <div style={dropdownDividerStyles}></div>
          <div style={dropdownItemStyles} onClick={handleLogout}>
            <span>🚪</span>
            <div>Logout</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
