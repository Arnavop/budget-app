import React, { createContext, useState, useEffect } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  // Define currency symbols for different currencies
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  // Format an amount with the selected currency
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    const symbol = getCurrencySymbol();
    
    // For Japanese Yen and Indian Rupee, don't show decimal places
    if (currency === 'JPY' || currency === 'INR') {
      return `${symbol}${Math.round(amount)}`;
    }
    
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency: updateCurrency,
      getCurrencySymbol,
      formatAmount
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider;