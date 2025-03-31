import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../../hooks/useExpenses';
import activities from '../../services/activities';

const STORAGE_KEY = 'budget_app_recent_expenses';

const ExpenseItem = ({ expense }) => {
  const navigate = useNavigate();
  const { deleteExpense } = useExpenses();

  const formatDate = (date) => {
    const today = new Date();
    const expenseDate = new Date(date);
    
    if (expenseDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (expenseDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return `${expenseDate.toLocaleDateString('en-US', { month: 'short' })} ${expenseDate.getDate()}`;
  };

  const removeFromLocalStorage = (expenseId) => {
    try {
      // Get existing expenses from localStorage
      const storedExpenses = localStorage.getItem(STORAGE_KEY);
      if (!storedExpenses) return;
      
      const expenses = JSON.parse(storedExpenses);
      
      // Filter out the deleted expense
      const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  const dispatchExpenseDeletedEvent = (expenseId) => {
    // Create and dispatch custom event for expense deletion
    const event = new CustomEvent('expenseDeleted', { 
      detail: { id: expenseId }
    });
    window.dispatchEvent(event);
  };

  const expenseItemStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 120px 60px',
    padding: '12px 0',
    borderBottom: '1px solid var(--bg-tertiary)',
    alignItems: 'center',
    gap: '10px',
  };

  const expenseDescStyles = {
    fontWeight: '500',
  };

  const expenseDetailsStyles = {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    marginTop: '3px',
  };

  const expenseAmountStyles = {
    fontWeight: '500',
    textAlign: 'right',
  };

  const expenseDateStyles = {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  };

  const expenseActionsStyles = {
    display: 'flex',
    gap: '5px',
  };

  const actionBtnStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  };

  const categoryStyles = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    marginLeft: '5px',
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Food':
        return {
          ...categoryStyles,
          backgroundColor: 'rgba(255, 87, 34, 0.2)',
          color: '#ff5722',
        };
      case 'Transport':
        return {
          ...categoryStyles,
          backgroundColor: 'rgba(3, 169, 244, 0.2)',
          color: '#03a9f4',
        };
      case 'Entertainment':
        return {
          ...categoryStyles,
          backgroundColor: 'rgba(156, 39, 176, 0.2)',
          color: '#9c27b0',
        };
      case 'Utilities':
        return {
          ...categoryStyles,
          backgroundColor: 'rgba(255, 152, 0, 0.2)',
          color: '#ff9800',
        };
      default:
        return {
          ...categoryStyles,
          backgroundColor: 'rgba(158, 158, 158, 0.2)',
          color: '#9e9e9e',
        };
    }
  };

  const handleEdit = () => {
    navigate(`/expenses/${expense.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        // Delete from the service first
        await deleteExpense(expense.id);
        
        // Create activity for deletion
        await activities.create({
          action: 'deleted',
          resourceType: 'expense',
          resourceId: expense.id,
          metadata: {
            description: expense.description,
            amount: expense.amount
          }
        });
        
        // Remove from localStorage
        removeFromLocalStorage(expense.id);
        
        // Dispatch event to update UI
        dispatchExpenseDeletedEvent(expense.id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  return (
    <div style={expenseItemStyles}>
      <div>
        <div style={expenseDescStyles}>
          {expense.description} 
          <span style={getCategoryStyles(expense.category)}>
            {expense.category}
          </span>
        </div>
        <div style={expenseDetailsStyles}>
          {expense.paidBy} paid, split {expense.splitMethod || 'equally'} 
          {expense.paidBy !== 'You' && expense.splitWith?.includes('You') ? ' with You' : ''}
          {expense.paidBy === 'You' && expense.splitWith?.length > 0 ? 
            ` with ${expense.splitWith.join(', ')}` : ''}
        </div>
      </div>
      <div style={expenseAmountStyles}>${expense.amount.toFixed(2)}</div>
      <div style={expenseDateStyles}>{formatDate(expense.date)}</div>
      <div style={expenseActionsStyles}>
        <button 
          style={actionBtnStyles} 
          onClick={handleEdit}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'var(--bg-tertiary)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--text-secondary)';
          }}
        >
          ✏️
        </button>
        <button 
          style={actionBtnStyles}
          onClick={handleDelete}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'var(--bg-tertiary)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--text-secondary)';
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;
