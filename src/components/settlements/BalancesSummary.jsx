import React from 'react';
import Card from '../common/Card';

const BalancesSummary = ({ balances }) => {
  // Calculate total balance
  const totalOwed = balances
    .filter(balance => balance.balance < 0)
    .reduce((sum, balance) => sum + Math.abs(balance.balance), 0);
    
  const totalOwing = balances
    .filter(balance => balance.balance > 0)
    .reduce((sum, balance) => sum + balance.balance, 0);
    
  const cardStyles = {
    padding: '20px',
    marginBottom: '24px',
  };
  
  const headerStyles = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  };
  
  const summaryStyles = {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--bg-tertiary)',
  };
  
  const totalItemStyles = {
    textAlign: 'center',
  };
  
  const totalLabelStyles = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  };
  
  const totalAmountStyles = {
    fontSize: '24px',
    fontWeight: '700',
  };
  
  const listStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  };
  
  const getBalanceItemStyles = (balance) => {
    let textColor = 'inherit';
    
    if (balance === 0) textColor = 'inherit';
    else if (balance > 0) textColor = '#4caf50'; // green
    else textColor = '#f44336'; // red
    
    return {
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 16px',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-secondary)',
      color: textColor,
    };
  };
  
  const balanceRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  };
  
  const balanceNameStyles = {
    fontWeight: '500',
  };
  
  const balanceAmountStyles = {
    fontWeight: '600',
  };
  
  const settlementInstructionStyles = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    marginTop: '4px',
  };

  const arrowStyles = {
    marginRight: '8px',
    marginLeft: '8px',
  };

  return (
    <Card style={cardStyles}>
      <div style={headerStyles}>Balance Summary</div>
      
      <div style={summaryStyles}>
        <div style={totalItemStyles}>
          <div style={totalLabelStyles}>You are owed</div>
          <div style={{...totalAmountStyles, color: '#4caf50'}}>
            ${totalOwing.toFixed(2)}
          </div>
        </div>
        
        <div style={totalItemStyles}>
          <div style={totalLabelStyles}>You owe</div>
          <div style={{...totalAmountStyles, color: '#f44336'}}>
            ${totalOwed.toFixed(2)}
          </div>
        </div>
      </div>
      
      <div style={listStyles}>
        {balances.map(balance => (
          balance.name !== 'You' && (
            <div 
              key={balance.name} 
              style={getBalanceItemStyles(balance.balance)}
            >
              <div style={balanceRowStyles}>
                <div style={balanceNameStyles}>{balance.name}</div>
                <div style={balanceAmountStyles}>
                  {balance.balance === 0 
                    ? 'Settled up'
                    : balance.balance > 0 
                      ? `+$${balance.balance.toFixed(2)}` 
                      : `-$${Math.abs(balance.balance).toFixed(2)}`}
                </div>
              </div>
              
              {balance.balance !== 0 && (
                <div style={settlementInstructionStyles}>
                  {balance.balance > 0 ? (
                    <>
                      <span>{balance.name}</span>
                      <span style={arrowStyles}>→</span>
                      <span>You</span>
                      <span style={arrowStyles}>•</span>
                      <span>${balance.balance.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <span>You</span>
                      <span style={arrowStyles}>→</span>
                      <span>{balance.name}</span>
                      <span style={arrowStyles}>•</span>
                      <span>${Math.abs(balance.balance).toFixed(2)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </Card>
  );
};

export default BalancesSummary;