import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';

const STORAGE_KEY = 'budget_app_balances';
const EXPENSES_STORAGE_KEY = 'budget_app_recent_expenses';

const BalancesSummary = ({ balances: propBalances = [], onCreateSettlement, renderActions }) => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const calculateBalancesFromExpenses = () => {
      try {
        if (propBalances && propBalances.length > 0) {
          console.log("Using prop balances:", propBalances);
          setBalances(propBalances);
          setLoading(false);
          return;
        }
        
        const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
        if (!storedExpenses) {
          setBalances([]);
          setLoading(false);
          return;
        }
        
        const expenses = JSON.parse(storedExpenses);
        console.log("Calculating balances from expenses:", expenses);
        
        const userBalances = {};
        
        expenses.forEach(expense => {
          if (!expense.amount) return;
          
          const amount = parseFloat(expense.amount);
          const paidBy = expense.paidBy;
          const splitWith = expense.splitWith || [];
          
          let splitCount = splitWith.length + 1;
          if (splitCount < 1) splitCount = 1;
          
          const splitAmount = amount / splitCount;
          
          if (paidBy === 'You') {
            splitWith.forEach(user => {
              if (!userBalances[user]) {
                userBalances[user] = { name: user, balance: 0 };
              }
              userBalances[user].balance += splitAmount;
            });
          }
          else {
            if (splitWith.includes('You')) {
              if (!userBalances[paidBy]) {
                userBalances[paidBy] = { name: paidBy, balance: 0 };
              }
              userBalances[paidBy].balance -= splitAmount;
            }
          }
        });
        
        const balancesArray = Object.values(userBalances);
        console.log("Calculated balances:", balancesArray);
        
        setBalances(balancesArray);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(balancesArray));
      } catch (error) {
        console.error('Error calculating balances:', error);
        setBalances([]);
      } finally {
        setLoading(false);
      }
    };
    
    calculateBalancesFromExpenses();
    
    const handleExpenseChange = () => {
      calculateBalancesFromExpenses();
    };
    
    window.addEventListener('expenseAdded', handleExpenseChange);
    window.addEventListener('expenseDeleted', handleExpenseChange);
    window.addEventListener('expenseUpdated', handleExpenseChange);
    window.addEventListener('balancesUpdated', handleExpenseChange);
    
    return () => {
      window.removeEventListener('expenseAdded', handleExpenseChange);
      window.removeEventListener('expenseDeleted', handleExpenseChange);
      window.removeEventListener('expenseUpdated', handleExpenseChange);
      window.removeEventListener('balancesUpdated', handleExpenseChange);
    };
  }, [propBalances, currentUser]);

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
    else if (balance > 0) textColor = '#4caf50';
    else textColor = '#f44336'; 
    
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

  const balanceItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    marginBottom: '12px',
  };

  const actionsStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '8px',
  };

  if (loading) {
    return (
      <Card style={cardStyles}>
        <div style={headerStyles}>Balance Summary</div>
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
          Loading balances...
        </div>
      </Card>
    );
  }

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
              key={balance.name || balance.userId} 
              style={{
                ...balanceItemStyle,
                color: balance.balance === 0 ? 'inherit' : 
                       balance.balance > 0 ? '#4caf50' : '#f44336'
              }}
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
              
              {renderActions && balance.balance !== 0 && (
                <div style={actionsStyles}>
                  {renderActions(balance)}
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