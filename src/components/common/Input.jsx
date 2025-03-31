import React from 'react';

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  style, 
  label,
  required = false
}) => {
  const inputStyles = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid var(--bg-tertiary)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    ...style
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      {label && <label style={labelStyles}>{label}{required && ' *'}</label>}
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange}
        style={inputStyles}
        required={required}
      />
    </div>
  );
};

export default Input;
