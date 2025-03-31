import React, { createContext, useState, useEffect } from 'react';
import expenseService from '../services/expenses';
import { useAuth } from '../hooks/useAuth';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch expenses when user changes
  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }
    
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await expenseService.getAll();
        setExpenses(data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError("Failed to load expenses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExpenses();
    
    // No need for real-time subscriptions with mock data
  }, [currentUser]);

  // CRUD operations
  const addExpense = async (expenseData) => {
    try {
      const newExpense = await expenseService.create(expenseData);
      setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
      return newExpense;
    } catch (err) {
      console.error("Error adding expense:", err);
      throw err;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const updated = await expenseService.update(id, expenseData);
      setExpenses(prevExpenses => 
        prevExpenses.map(expense => 
          expense.id === id ? updated : expense
        )
      );
      return updated;
    } catch (err) {
      console.error("Error updating expense:", err);
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseService.delete(id);
      setExpenses(prevExpenses => 
        prevExpenses.filter(expense => expense.id !== id)
      );
      return true;
    } catch (err) {
      console.error("Error deleting expense:", err);
      throw err;
    }
  };

  const getExpenseById = (id) => {
    return expenses.find(expense => expense.id === id);
  };

  const settleExpense = async (id, settled = true) => {
    try {
      const updated = await expenseService.settleExpense(id, settled);
      setExpenses(prevExpenses => 
        prevExpenses.map(expense => 
          expense.id === id ? {...expense, isSettled: settled} : expense
        )
      );
      return updated;
    } catch (err) {
      console.error("Error settling expense:", err);
      throw err;
    }
  };

  const getExpensesByGroup = async (groupId) => {
    try {
      return await expenseService.getByGroup(groupId);
    } catch (err) {
      console.error("Error fetching group expenses:", err);
      throw err;
    }
  };

  const getExpenseStats = async () => {
    try {
      return await expenseService.getStats();
    } catch (err) {
      console.error("Error fetching expense stats:", err);
      throw err;
    }
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      isLoading,
      error,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpenseById,
      settleExpense,
      getExpensesByGroup,
      getExpenseStats,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseProvider;
