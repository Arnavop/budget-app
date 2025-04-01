import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

const SETTLEMENTS_STORAGE_KEY = 'budget_app_settlements';
const BALANCES_STORAGE_KEY = 'budget_app_balances';
const EXPENSES_STORAGE_KEY = 'budget_app_recent_expenses';

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock users data
  const mockUsers = [
    {
      id: '1',
      name: 'You',
      email: 'user@example.com',
      avatar: 'Y',
      color: 'var(--accent)'
    },
    {
      id: '2',
      name: 'Alex',
      email: 'alex@example.com',
      avatar: 'A',
      color: '#4285F4'
    },
    {
      id: '3',
      name: 'Sam',
      email: 'sam@example.com',
      avatar: 'S',
      color: '#EA4335'
    },
    {
      id: '4',
      name: 'Jordan',
      email: 'jordan@example.com',
      avatar: 'J',
      color: '#34A853'
    }
  ];

  useEffect(() => {
    // Load users
    setUsers(mockUsers);
    
    // Load settlements from localStorage
    const storedSettlements = localStorage.getItem(SETTLEMENTS_STORAGE_KEY);
    if (storedSettlements) {
      setSettlements(JSON.parse(storedSettlements));
    }
    
    // Load balances from localStorage
    const storedBalances = localStorage.getItem(BALANCES_STORAGE_KEY);
    if (storedBalances) {
      setBalances(JSON.parse(storedBalances));
    } else {
      // Calculate initial balances from expenses if available
      calculateBalancesFromExpenses();
    }
    
    setLoading(false);
  }, []);
  
  // Calculate balances from expenses in localStorage
  const calculateBalancesFromExpenses = () => {
    try {
      const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
      if (!storedExpenses) return [];
      
      const expenses = JSON.parse(storedExpenses);
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
            const userId = mockUsers.find(u => u.name === user)?.id || user;
            if (!userBalances[userId]) {
              userBalances[userId] = { userId, name: user, balance: 0 };
            }
            userBalances[userId].balance += splitAmount;
          });
        }
        // Someone else paid
        else {
          // Add negative balance (you owe them)
          if (splitWith.includes('You')) {
            const userId = mockUsers.find(u => u.name === paidBy)?.id || paidBy;
            if (!userBalances[userId]) {
              userBalances[userId] = { userId, name: paidBy, balance: 0 };
            }
            userBalances[userId].balance -= splitAmount;
          }
        }
      });
      
      // Convert to array and save to state and localStorage
      const calculatedBalances = Object.values(userBalances);
      setBalances(calculatedBalances);
      localStorage.setItem(BALANCES_STORAGE_KEY, JSON.stringify(calculatedBalances));
      
      return calculatedBalances;
    } catch (error) {
      console.error('Error calculating balances:', error);
      return [];
    }
  };
  
  // Get current balances for all users
  const getBalances = async () => {
    // In a real app, this would be fetched from an API
    return balances;
  };
  
  // Get all settlements
  const getSettlements = async () => {
    // In a real app, this would be fetched from an API
    return settlements;
  };
  
  // Create a new settlement
  const createSettlement = async (fromUserId, toUserId, amount) => {
    try {
      // In a real app, this would be sent to an API
      const toUser = users.find(user => user.id === toUserId);
      
      if (!toUser) {
        throw new Error('User not found');
      }
      
      const newSettlement = {
        id: `settlement-${Date.now()}`,
        fromUserId,
        toUserId,
        toUserName: toUser.name,
        amount: parseFloat(amount),
        created: new Date(),
        completed: false
      };
      
      // Update settlements state and localStorage
      const updatedSettlements = [newSettlement, ...settlements];
      setSettlements(updatedSettlements);
      localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(updatedSettlements));
      
      // Update balances to reflect the new settlement
      const updatedBalances = balances.map(balance => {
        if (balance.userId === toUserId) {
          return {
            ...balance,
            balance: balance.balance + parseFloat(amount)
          };
        }
        return balance;
      });
      
      setBalances(updatedBalances);
      localStorage.setItem(BALANCES_STORAGE_KEY, JSON.stringify(updatedBalances));
      
      // Dispatch event to notify components of balance changes
      window.dispatchEvent(new CustomEvent('balancesUpdated'));
      
      return newSettlement;
    } catch (error) {
      console.error('Error creating settlement:', error);
      throw error;
    }
  };
  
  // Mark a settlement as completed
  const completeSettlement = async (settlementId) => {
    try {
      // In a real app, this would be sent to an API
      const updatedSettlements = settlements.map(settlement => 
        settlement.id === settlementId 
          ? { ...settlement, completed: true } 
          : settlement
      );
      
      setSettlements(updatedSettlements);
      localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(updatedSettlements));
      
      return { success: true };
    } catch (error) {
      console.error('Error completing settlement:', error);
      throw error;
    }
  };

  const addUser = (user) => {
    setUsers([...users, { ...user, id: Date.now().toString() }]);
  };

  const updateUser = (id, updatedUser) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...updatedUser } : user
    ));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <UserContext.Provider value={{
      users,
      loading,
      addUser,
      updateUser,
      deleteUser,
      getBalances,
      getSettlements,
      createSettlement,
      completeSettlement,
      calculateBalancesFromExpenses
    }}>
      {children}
    </UserContext.Provider>
  );
};
