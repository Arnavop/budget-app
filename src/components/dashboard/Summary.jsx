import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        
        console.log("Loaded expenses:", expenses); // Debug
        
        // Calculate total expenses
        let total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
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
          if (!expense.amount) return; // Skip if no amount
          
          const amount = parseFloat(expense.amount);
          
          // Get split count and amount per person
          let splitCount = (expense.splitWith?.length || 0) + 1; // +1 for the payer
          if (splitCount < 1) splitCount = 1; // Ensure at least 1 for division
          
          const splitAmount = amount / splitCount;
          
          if (expense.paidBy === 'You') {
            // Current user paid, others owe them
            expense.splitWith?.forEach(userName => {
              // Find user ID
              const user = usersList?.find(u => u.name === userName);
              if (user && userBalances[user.id]) {
                // Add to what this user owes the current user
                userBalances[user.id].balance += splitAmount;
                userIsOwed += splitAmount;
              }
            });
          } else {
            // Someone else paid - this is where the issue is happening
            const paidByUser = usersList?.find(u => u.name === expense.paidBy);
            
            if (paidByUser && userBalances[paidByUser.id]) {
              // If the expense has split information
              if (expense.splitWith) {
                // Check if current user is in the split
                if (expense.splitWith.includes('You')) {
                  // Current user owes the person who paid
                  const userSplitAmount = splitAmount; // Each person owes this amount
                  userBalances[paidByUser.id].balance -= userSplitAmount;
                  userOwes += userSplitAmount;
                  
                  // For debugging
                  console.log(`Added debt to ${paidByUser.name}: ${userSplitAmount}`);
                }
              } else {
                // Fallback if splitWith is missing - assume you're part of the split
                // This handles potential inconsistencies in the expense data
                const fallbackSplitAmount = amount / 2; // Assume split between payer and you
                userBalances[paidByUser.id].balance -= fallbackSplitAmount;
                userOwes += fallbackSplitAmount;
                
                // For debugging
                console.log(`Fallback: Added debt to ${paidByUser.name}: ${fallbackSplitAmount}`);
              }
            }
          }
        });
        
        console.log("Calculated balances:", userBalances); // Debug
        console.log("User owes:", userOwes, "User is owed:", userIsOwed); // Debug
        
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
        
        // Listen for expense changes to update balances
        const handleExpenseChange = () => {
          fetchData();
        };
        
        window.addEventListener('expenseAdded', handleExpenseChange);
        window.addEventListener('expenseDeleted', handleExpenseChange);
        window.addEventListener('expenseUpdated', handleExpenseChange);

        const dispatchExpenseAddedEvent = (expense) => {
          // Create and dispatch custom event with expense data
          const event = new CustomEvent('expenseAdded', { 
            detail: expense,
            bubbles: true,  // Make sure event bubbles
            cancelable: true
          });
          window.dispatchEvent(event);
        };
        
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

  // Helper to check if we have any data
  const hasData = () => {
    return balances.some(balance => balance.balance !== 0) || userBalance !== 0;
  };

  // Rest of the component remains unchanged
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
    flexDirection: 'column',
    padding: '10px 0',
    borderBottom: '1px solid var(--bg-tertiary)'
  };
  
  const balanceRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
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

  const settlementInstructionStyles = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    paddingLeft: '4px'
  };

  const arrowStyles = {
    marginRight: '8px',
    marginLeft: '8px',
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
  
  const footerLinkStyles = {
    display: 'block',
    textAlign: 'center',
    color: 'var(--accent)',
    textDecoration: 'none',
    marginTop: '15px',
    padding: '10px',
    borderTop: '1px solid var(--bg-tertiary)',
  };
  
  const emptyStateStyles = {
    textAlign: 'center',
    padding: '20px',
    color: 'var(--text-secondary)',
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
        <div style={emptyStateStyles}>Loading balances...</div>
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
                : hasData() ? 'You are all settled up' : 'No expenses yet'}
          </div>
          
          {balances.length > 0 ? (
            <div>
              {balances.map((balance) => (
                <div key={balance.userId} style={balanceListItemStyles}>
                  <div style={balanceRowStyles}>
                    <span style={balanceNameStyles}>{balance.name}</span>
                    <div style={balanceActionsStyles}>
                      <div style={balanceAmountStyles}>
                        {balance.balance > 0 ? (
                          <span style={{ color: 'var(--success)' }}>
                            +${balance.balance.toFixed(2)}
                          </span>
                        ) : balance.balance < 0 ? (
                          <span style={{ color: 'var(--error)' }}>
                            ${balance.balance.toFixed(2)}
                          </span>
                        ) : (
                          <span>$0.00</span>
                        )}
                      </div>
                      {balance.balance !== 0 && (
                        <button 
                          style={actionButtonStyles}
                          onClick={() => handleCreateSettlement(balance.userId, balance.balance)}
                        >
                          Settle Up
                        </button>
                      )}
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
              ))}
            </div>
          ) : (
            <div style={emptyStateStyles}>No users to settle with</div>
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
            <div style={emptyStateStyles}>
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
      
      {/* Link to Settlements page */}
      <Link to="/settlements" style={footerLinkStyles}>
        View All Settlements →
      </Link>
    </Card>
  );
};

export default Summary;
