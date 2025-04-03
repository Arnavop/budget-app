import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useUsers } from '../../hooks/useUsers';
import users from '../../services/users';
import activities from '../../services/activities';
import { useAuth } from '../../hooks/useAuth';
import { useExpenses } from '../../hooks/useExpenses';

const Summary = () => {
  const [activeTab, setActiveTab] = useState('balances');
  const { users: usersList } = useUsers();
  const { currentUser } = useAuth();
  const { expenses } = useExpenses(); // Use the expenses from context
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
        
        // Use expenses from ExpenseContext instead of localStorage
        let total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
        let userOwes = 0;
        let userIsOwed = 0;
        
        const userBalances = {};
        
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
        
        expenses.forEach(expense => {
          if (!expense.amount) return;
          
          const amount = parseFloat(expense.amount);
          
          let splitCount = (expense.splitWith?.length || 0) + 1;
          if (splitCount < 1) splitCount = 1;
          
          const splitAmount = amount / splitCount;
          
          if (expense.paidBy === 'You') {
            expense.splitWith?.forEach(userName => {
              const user = usersList?.find(u => u.name === userName);
              if (user && userBalances[user.id]) {
                userBalances[user.id].balance += splitAmount;
                userIsOwed += splitAmount;
              }
            });
          } else {
            const paidByUser = usersList?.find(u => u.name === expense.paidBy);
            
            if (paidByUser && userBalances[paidByUser.id]) {
              if (expense.splitWith) {
                if (expense.splitWith.includes('You')) {
                  const userSplitAmount = splitAmount;
                  userBalances[paidByUser.id].balance -= userSplitAmount;
                  userOwes += userSplitAmount;
                  
                  console.log(`Added debt to ${paidByUser.name}: ${userSplitAmount}`);
                }
              } else {
                const fallbackSplitAmount = amount / 2;
                userBalances[paidByUser.id].balance -= fallbackSplitAmount;
                userOwes += fallbackSplitAmount;
                
                console.log(`Fallback: Added debt to ${paidByUser.name}: ${fallbackSplitAmount}`);
              }
            }
          }
        });
        
        console.log("Calculated balances:", userBalances);
        console.log("User owes:", userOwes, "User is owed:", userIsOwed);
        
        setTotalExpenses(total);
        setUserBalance(userIsOwed - userOwes);
        setBalances(Object.values(userBalances));
        
        const userSettlements = await users.getSettlements();
        setSettlements(userSettlements.filter(s => !s.completed));
      } catch (error) {
        console.error('Error calculating balances:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, usersList, expenses]); // Add expenses as a dependency

  const hasData = () => {
    return balances.some(balance => balance.balance !== 0) || userBalance !== 0;
  };

  const handleRemind = async (settlement) => {
    try {
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
      let fromUserId, toUserId;
      if (amount > 0) {
        fromUserId = userId;
        toUserId = currentUser.id;
      } else {
        fromUserId = currentUser.id;
        toUserId = userId;
        amount = Math.abs(amount);
      }
      
      await users.createSettlement(fromUserId, toUserId, amount);
      alert('Settlement created successfully!');
      
      const userSettlements = await users.getSettlements();
      setSettlements(userSettlements.filter(s => !s.completed));
    } catch (error) {
      console.error('Error creating settlement:', error);
    }
  };

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
      
      <Link to="/settlements" style={footerLinkStyles}>
        View All Settlements →
      </Link>
    </Card>
  );
};

export default Summary;
