import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useUsers } from '../../hooks/useUsers';
import users from '../../services/users';
import activities from '../../services/activities';
import { useAuth } from '../../hooks/useAuth';

const STORAGE_KEY = 'budget_app_recent_expenses';

const Summary = () => {
  const [activeTab, setActiveTab] = useState('balances');
  const { users: usersList } = useUsers();
  const { currentUser } = useAuth();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get expenses from localStorage
        const storedExpenses = localStorage.getItem(STORAGE_KEY);
        const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
        
        // Calculate total expenses
        let total = 0;
        let userOwes = 0;
        let userIsOwed = 0;
        
        // Calculate user balances based on stored expenses
        const userBalances = {};
        
        // Initialize balance objects for each user
        if (usersList) {
          usersList.forEach(user => {
            if (user.name !== 'You') {
              userBalances[user.id] = {
                userId: user.id,
                name: user.name,
                balance: 0
              };
            }
          });
        }
        
        // Process expenses to calculate balances
        expenses.forEach(expense => {
          // Add to total
          total += expense.amount;
          
          const paidByCurrentUser = expense.paidBy === 'You';
          const splitCount = expense.splitWith.length + 1; // +1 for person who paid
          const splitAmount = expense.amount / splitCount;
          
          if (paidByCurrentUser) {
            // Current user paid, so others owe them
            expense.splitWith.forEach(userName => {
              // Find user ID
              const user = usersList?.find(u => u.name === userName);
              if (user && userBalances[user.id]) {
                // Add to what this user owes the current user
                userBalances[user.id].balance += splitAmount;
                userIsOwed += splitAmount;
              }
            });
          } else {
            // Someone else paid and current user might be part of split
            if (expense.splitWith.includes('You')) {
              // Find who paid
              const paidByUser = usersList?.find(u => u.name === expense.paidBy);
              if (paidByUser && userBalances[paidByUser.id]) {
                // Current user owes the person who paid
                userBalances[paidByUser.id].balance -= splitAmount;
                userOwes += splitAmount;
              }
            }
          }
        });
        
        // Set total expenses
        setTotalExpenses(total);
        
        // Set user's net balance (what they are owed minus what they owe)
        setUserBalance(userIsOwed - userOwes);
        
        // Set balances for other users
        setBalances(Object.values(userBalances));
        
        // For settlements, we'll still use the mock data service or
        // create settlements based on calculated balances
        const userSettlements = await users.getSettlements();
        setSettlements(userSettlements.filter(s => !s.completed));
        
        // Optionally: Listen for expense changes to update balances
        const handleExpenseChange = () => {
          fetchData();
        };
        
        window.addEventListener('expenseAdded', handleExpenseChange);
        window.addEventListener('expenseDeleted', handleExpenseChange);
        window.addEventListener('expenseUpdated', handleExpenseChange);
        
        return () => {
          window.removeEventListener('expenseAdded', handleExpenseChange);
          window.removeEventListener('expenseDeleted', handleExpenseChange);
          window.removeEventListener('expenseUpdated', handleExpenseChange);
        };
      } catch (error) {
        console.error('Error calculating balances:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, usersList]);

  const handleRemind = async (settlement) => {
    try {
      // Create a notification activity using the activities service
      await activities.create({
        action: 'reminder',
        resourceType: 'settlement',
        resourceId: settlement.id,
        metadata: {
          amount: settlement.amount,
          fromUserId: settlement.fromUserId,
          toUserId: settlement.toUserId
        }
      });
      
      alert('Reminder sent!');
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };
  
  const handleRemindAll = async () => {
    try {
      // For each settlement, create a notification activity
      for (const settlement of settlements) {
        await activities.create({
          action: 'reminder',
          resourceType: 'settlement',
          resourceId: settlement.id,
          metadata: {
            amount: settlement.amount,
            fromUserId: settlement.fromUserId,
            toUserId: settlement.toUserId
          }
        });
      }
      
      alert('All reminders sent!');
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  };

  const handleCreateSettlement = async (userId, amount) => {
    if (!currentUser) return;
    
    try {
      // Determine who should pay whom
      let fromUserId, toUserId;
      if (amount > 0) {
        // Positive balance means the other user owes the current user
        fromUserId = userId;
        toUserId = currentUser.id;
      } else {
        // Negative balance means the current user owes the other user
        fromUserId = currentUser.id;
        toUserId = userId;
        amount = Math.abs(amount); // Make amount positive
      }
      
      await users.createSettlement(fromUserId, toUserId, amount);
      alert('Settlement created successfully!');
      
      // Refresh data
      const userSettlements = await users.getSettlements();
      setSettlements(userSettlements.filter(s => !s.completed));
    } catch (error) {
      console.error('Error creating settlement:', error);
    }
  };

  // Styling
  const tabContainerStyles = {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '1px solid var(--bg-tertiary)'
  };
  
  const tabStyles = (isActive) => ({
    padding: '10px 15px',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid var(--accent)' : 'none',
    fontWeight: isActive ? 'bold' : 'normal'
  });
  
  const userBalanceStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px'
  };
  
  const balanceListItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--bg-tertiary)'
  };
  
  const balanceNameStyles = {
    fontSize: '16px',
    fontWeight: '500'
  };
  
  const balanceAmountStyles = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginRight: '10px'
  };
  
  const balanceActionsStyles = {
    display: 'flex',
    alignItems: 'center'
  };
  
  const actionButtonStyles = {
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '14px',
    cursor: 'pointer'
  };
  
  const settlementItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--bg-tertiary)'
  };
  
  const settlementRightSideStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };
  
  return (
    <Card>
      <div style={tabContainerStyles}>
        <div 
          style={tabStyles(activeTab === 'balances')} 
          onClick={() => setActiveTab('balances')}
        >
          Balances
        </div>
        <div 
          style={tabStyles(activeTab === 'settlements')} 
          onClick={() => setActiveTab('settlements')}
        >
          Settlements
        </div>
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : activeTab === 'balances' ? (
        <div>
          <div style={userBalanceStyles}>
            {userBalance > 0 ? (
              <span style={{ color: 'var(--success)' }}>+${userBalance.toFixed(2)}</span>
            ) : userBalance < 0 ? (
              <span style={{ color: 'var(--error)' }}>${userBalance.toFixed(2)}</span>
            ) : (
              <span>$0.00</span>
            )}
          </div>
          
          <div style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {userBalance > 0 
              ? 'You are owed money' 
              : userBalance < 0 
                ? 'You owe money' 
                : 'You are all settled up'}
          </div>
          
          {balances.length > 0 && (
            <div>
              {balances.map((balance) => (
                <div key={balance.userId} style={balanceListItemStyles}>
                  <span style={balanceNameStyles}>{balance.name}</span>
                  <div style={balanceActionsStyles}>
                    <div style={balanceAmountStyles}>
                      {balance.balance > 0 ? (
                        <span style={{ color: 'var(--success)' }}>
                          +${balance.balance.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--error)' }}>
                          ${balance.balance.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button 
                      style={actionButtonStyles}
                      onClick={() => handleCreateSettlement(balance.userId, balance.balance)}
                    >
                      Settle Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Outstanding Settlements</h3>
            {settlements.length > 0 && (
              <Button 
                text="Remind All" 
                onClick={handleRemindAll}
                variant="small"
              />
            )}
          </div>
          
          {settlements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              No outstanding settlements
            </div>
          ) : (
            settlements.map(settlement => {
              return (
                <div key={settlement.id} style={settlementItemStyles}>
                  <span>{settlement.toUser}</span>
                  <div style={settlementRightSideStyles}>
                    <div style={balanceAmountStyles}>
                      ${settlement.amount.toFixed(2)}
                    </div>
                    {settlement.fromUser !== 'You' && (
                      <button 
                        style={actionButtonStyles}
                        onClick={() => handleRemind(settlement)}
                      >
                        Remind
                      </button>
                    )}
                    {settlement.fromUser === 'You' && (
                      <button 
                        style={actionButtonStyles}
                        onClick={async () => {
                          try {
                            await users.completeSettlement(settlement.id);
                            // Refresh settlements
                            const userSettlements = await users.getSettlements();
                            setSettlements(userSettlements.filter(s => !s.completed));
                          } catch (error) {
                            console.error('Error completing settlement:', error);
                          }
                        }}
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Card>
  );
};

export default Summary;
