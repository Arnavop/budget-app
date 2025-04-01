import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';

// Storage keys
const STORAGE_KEY = 'budget_app_balances';
const EXPENSES_STORAGE_KEY = 'budget_app_recent_expenses';

const BalancesSummary = ({ balances: propBalances = [] }) => {
  // State to store balances from localStorage or props
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Calculate balances from expenses in localStorage
  useEffect(() => {
    const calculateBalancesFromExpenses = () => {
      try {
        // Check if we have valid balances from props
        if (propBalances && propBalances.length > 0) {
          console.log("Using prop balances:", propBalances);
          setBalances(propBalances);
          setLoading(false);
          return;
        }
        
        // Get expenses from localStorage
        const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
        if (!storedExpenses) {
          setBalances([]);
          setLoading(false);
          return;
        }
        
        const expenses = JSON.parse(storedExpenses);
        console.log("Calculating balances from expenses:", expenses);
        
        // Calculate balances based on expenses
        const userBalances = {};
        
        expenses.forEach(expense => {
          if (!expense.amount) return;
          
          const amount = parseFloat(expense.amount);
          const paidBy = expense.paidBy;
          const splitWith = expense.splitWith || [];
          
          // Calculate split amount
          let splitCount = splitWith.length + 1; // +1 for the person who paid
          if (splitCount < 1) splitCount = 1;
          
          const splitAmount = amount / splitCount;
          
          // User is the one who paid
          if (paidBy === 'You') {
            // Add positive balance (others owe you)
            splitWith.forEach(user => {
              if (!userBalances[user]) {
                userBalances[user] = { name: user, balance: 0 };
              }
              userBalances[user].balance += splitAmount;
            });
          }
          // Someone else paid
          else {
            // Add negative balance (you owe them)
            if (splitWith.includes('You')) {
              if (!userBalances[paidBy]) {
                userBalances[paidBy] = { name: paidBy, balance: 0 };
              }
              userBalances[paidBy].balance -= splitAmount;
            }
          }
        });
        
        // Convert to array
        const balancesArray = Object.values(userBalances);
        console.log("Calculated balances:", balancesArray);
        
        setBalances(balancesArray);
        // Save calculated balances to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(balancesArray));
      } catch (error) {
        console.error('Error calculating balances:', error);
        setBalances([]);
      } finally {
        setLoading(false);
      }
    };
    
    calculateBalancesFromExpenses();
    
    // Listen for expense changes to update balances
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

  // Show a loading state
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