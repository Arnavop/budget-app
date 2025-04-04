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

  const loadExpenses = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const storedExpenses = localStorage.getItem(STORAGE_KEY);
      const parsedExpenses = storedExpenses ? JSON.parse(storedExpenses) : []; //json to js object
      
      let allExpenses = parsedExpenses;
      if (parsedExpenses.length === 0) {
        allExpenses = await expenses.getAll();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allExpenses));
      }
      
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

  useEffect(() => {
    const handleNewExpense = (event) => {
      const newExpense = event.detail;
      
      setRecentExpenses(prevExpenses => {
        const updatedExpenses = [newExpense, ...prevExpenses]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        return updatedExpenses;
      });
    };
    
    window.addEventListener('expenseAdded', handleNewExpense);
    
    return () => {
      window.removeEventListener('expenseAdded', handleNewExpense);
    };
  }, []);

  useEffect(() => {
    const handleDeletedExpense = (event) => {
      const { id: deletedId } = event.detail;
      
      setRecentExpenses(prevExpenses => {
        const filteredExpenses = prevExpenses.filter(expense => expense.id !== deletedId);
        
        if (filteredExpenses.length < 5) {
          const storedExpenses = localStorage.getItem(STORAGE_KEY);
          if (storedExpenses) {
            const allStoredExpenses = JSON.parse(storedExpenses);
            const potentialExpenses = allStoredExpenses.filter(
              exp => !filteredExpenses.some(fExp => fExp.id === exp.id)
            );
            
            if (potentialExpenses.length > 0) {
              filteredExpenses.push(potentialExpenses[0]);
              filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
          }
        }
        
        return filteredExpenses;
      });
    };
    
    window.addEventListener('expenseDeleted', handleDeletedExpense);
    
    return () => {
      window.removeEventListener('expenseDeleted', handleDeletedExpense);
    };
  }, []);

  useEffect(() => {
    const handleUpdatedExpense = (event) => {
      const updatedExpense = event.detail;
      
      setRecentExpenses(prevExpenses => {
        const expenseIndex = prevExpenses.findIndex(exp => exp.id === updatedExpense.id);
        
        if (expenseIndex !== -1) {
          const updatedExpenses = [...prevExpenses];
          updatedExpenses[expenseIndex] = updatedExpense;
          
          updatedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
          return updatedExpenses;
        }
        
        const oldestInList = prevExpenses.length > 0 
          ? prevExpenses.reduce((oldest, current) => 
              new Date(current.date) < new Date(oldest.date) ? current : oldest, 
              prevExpenses[0]
            )
          : null;
          
        if (oldestInList && 
            prevExpenses.length >= 5 && 
            new Date(updatedExpense.date) > new Date(oldestInList.date)) {
          const filteredExpenses = prevExpenses.filter(exp => exp.id !== oldestInList.id);
          const newExpenses = [...filteredExpenses, updatedExpense];
          newExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
          return newExpenses;
        }
        
        return prevExpenses;
      });
    };
    
    window.addEventListener('expenseUpdated', handleUpdatedExpense);
    
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
