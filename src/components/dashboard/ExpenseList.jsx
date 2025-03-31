import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import ExpenseItem from './ExpenseItem';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../hooks/useAuth';
import expenses from '../../services/expenses';

const STORAGE_KEY = 'budget_app_recent_expenses';

const ExpenseList = () => {
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Function to load expenses from localStorage and service
  const loadExpenses = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Try to get expenses from localStorage first
      const storedExpenses = localStorage.getItem(STORAGE_KEY);
      const parsedExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      // Also get from service as fallback
      let allExpenses = parsedExpenses;
      if (parsedExpenses.length === 0) {
        allExpenses = await expenses.getAll();
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allExpenses));
      }
      
      // Sort by date and take only the first 5
      const sorted = allExpenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
        
      setRecentExpenses(sorted);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [currentUser]);

  // Listen for custom event when a new expense is added
  useEffect(() => {
    const handleNewExpense = (event) => {
      const newExpense = event.detail;
      
      setRecentExpenses(prevExpenses => {
        // Add new expense to the list and sort
        const updatedExpenses = [newExpense, ...prevExpenses]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        return updatedExpenses;
      });
    };
    
    // Add event listener
    window.addEventListener('expenseAdded', handleNewExpense);
    
    // Cleanup
    return () => {
      window.removeEventListener('expenseAdded', handleNewExpense);
    };
  }, []);

  // Listen for custom event when an expense is deleted
  useEffect(() => {
    const handleDeletedExpense = (event) => {
      const { id: deletedId } = event.detail;
      
      setRecentExpenses(prevExpenses => {
        // Remove deleted expense from the list
        const filteredExpenses = prevExpenses.filter(expense => expense.id !== deletedId);
        
        // If we now have fewer than 5 expenses, we might want to load a new one
        if (filteredExpenses.length < 5) {
          const storedExpenses = localStorage.getItem(STORAGE_KEY);
          if (storedExpenses) {
            const allStoredExpenses = JSON.parse(storedExpenses);
            // Find expenses not currently in our list
            const potentialExpenses = allStoredExpenses.filter(
              exp => !filteredExpenses.some(fExp => fExp.id === exp.id)
            );
            
            if (potentialExpenses.length > 0) {
              // Add the next expense that's not already in the list
              filteredExpenses.push(potentialExpenses[0]);
              // Sort again
              filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
          }
        }
        
        return filteredExpenses;
      });
    };
    
    // Add event listener for expense deletion
    window.addEventListener('expenseDeleted', handleDeletedExpense);
    
    // Cleanup
    return () => {
      window.removeEventListener('expenseDeleted', handleDeletedExpense);
    };
  }, []);

  // Listen for custom event when an expense is updated
  useEffect(() => {
    const handleUpdatedExpense = (event) => {
      const updatedExpense = event.detail;
      
      setRecentExpenses(prevExpenses => {
        // Check if the updated expense is already in our list
        const expenseIndex = prevExpenses.findIndex(exp => exp.id === updatedExpense.id);
        
        // If it's in our list, update it
        if (expenseIndex !== -1) {
          const updatedExpenses = [...prevExpenses];
          updatedExpenses[expenseIndex] = updatedExpense;
          
          // Sort by date again in case the date changed
          updatedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
          return updatedExpenses;
        }
        
        // If it's not in our list but is recent enough to be displayed now,
        // add it and remove the oldest one
        const oldestInList = prevExpenses.length > 0 
          ? prevExpenses.reduce((oldest, current) => 
              new Date(current.date) < new Date(oldest.date) ? current : oldest, 
              prevExpenses[0]
            )
          : null;
          
        if (oldestInList && 
            prevExpenses.length >= 5 && 
            new Date(updatedExpense.date) > new Date(oldestInList.date)) {
          // Replace the oldest with the updated expense
          const filteredExpenses = prevExpenses.filter(exp => exp.id !== oldestInList.id);
          const newExpenses = [...filteredExpenses, updatedExpense];
          newExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
          return newExpenses;
        }
        
        // Otherwise, don't change the list
        return prevExpenses;
      });
    };
    
    // Add event listener for expense updates
    window.addEventListener('expenseUpdated', handleUpdatedExpense);
    
    // Cleanup
    return () => {
      window.removeEventListener('expenseUpdated', handleUpdatedExpense);
    };
  }, []);

  const cardTitleStyles = {
    fontSize: '18px', 
    fontWeight: 'bold',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <Card>
      <div style={cardTitleStyles}>
        Recent Expenses
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading expenses...</div>
      ) : recentExpenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
          No expenses yet. Add your first expense to get started!
        </div>
      ) : (
        recentExpenses.map(expense => (
          <ExpenseItem key={expense.id} expense={expense} />
        ))
      )}
    </Card>
  );
};

export default ExpenseList;
