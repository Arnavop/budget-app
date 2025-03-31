import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useExpenses } from '../../hooks/useExpenses';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import activities from '../../services/activities';

const STORAGE_KEY = 'budget_app_recent_expenses';

const AddExpenseForm = ({ onShowFullForm }) => {
  const { addExpense } = useExpenses();
  const { users } = useUsers();
  const { currentUser } = useAuth();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You paid');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    try {
      setLoading(true);
      
      // Extract the person who paid (remove " paid" suffix)
      const payer = paidBy.replace(' paid', '');
      
      // Create appropriate splitWith array based on who paid
      let splitWithUsers;
      
      if (payer === 'You') {
        // If you paid, split with everyone else
        splitWithUsers = users ? 
          users.filter(user => user.name !== 'You').map(user => user.name) : 
          ['Alex', 'Sam', 'Jordan']; // Fallback if no users loaded
      } else {
        // If someone else paid, include "You" in the split
        splitWithUsers = users ?
          users.filter(user => user.name !== payer && user.name !== 'You')
            .map(user => user.name)
            .concat(['You']) :
          ['You']; // Always include yourself in the split
      }
      
      const newExpense = await addExpense({
        description,
        amount: parseFloat(amount),
        paidBy: payer,
        paidByUserId: payer === 'You' ? currentUser.id : getUserId(payer),
        date: new Date(),
        splitWith: splitWithUsers,
        splitMethod: 'equal',
        category,
        notes: '',
      });

      // Create activity record for the new expense
      await activities.create({
        action: 'created',
        resourceType: 'expense',
        resourceId: newExpense.id,
        metadata: {
          description,
          amount: parseFloat(amount)
        }
      });
      
      // Save to localStorage
      saveToLocalStorage(newExpense);
      
      // Dispatch custom event to notify ExpenseList
      dispatchExpenseAddedEvent(newExpense);
      
      // Reset the form after successful submission
      setDescription('');
      setAmount('');
      setPaidBy('You paid');
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (newExpense) => {
    try {
      // Get existing expenses from localStorage
      const storedExpenses = localStorage.getItem(STORAGE_KEY);
      let expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      // Add new expense and sort by date (newest first)
      expenses = [newExpense, ...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };
  
  const dispatchExpenseAddedEvent = (expense) => {
    // Create and dispatch custom event with expense data
    const event = new CustomEvent('expenseAdded', { 
      detail: expense 
    });
    window.dispatchEvent(event);
  };

  const getUserId = (userName) => {
    // Find matching user and return their ID
    const user = users.find(u => u.name === userName);
    return user ? user.id : null;
  };

  const cardTitleStyles = {
    fontSize: '18px', 
    fontWeight: 'bold',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const expenseFormStyles = {
    display: 'grid',
    gap: '15px'
  };

  const selectStyles = {
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid var(--bg-tertiary)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    width: '100%'
  };

  return (
    <Card>
      <div style={cardTitleStyles}>
        Add Expense
        <Button 
          text="Split Multiple" 
          variant="text" 
          onClick={onShowFullForm}
        />
      </div>
      
      <form onSubmit={handleSubmit} style={expenseFormStyles}>
        <Input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
          required
        />
        <select 
          value={paidBy} 
          onChange={(e) => setPaidBy(e.target.value)}
          style={selectStyles}
          disabled={loading}
        >
          <option>You paid</option>
          {users && users
            .filter(user => user.name !== 'You')
            .map(user => (
              <option key={user.id}>{user.name} paid</option>
            ))
          }
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={selectStyles}
          disabled={loading}
        >
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Utilities">Utilities</option>
          <option value="Other">Other</option>
        </select>
        <Button 
          type="submit" 
          text={loading ? "Adding..." : "Add Expense"} 
          disabled={loading}
        />
      </form>
    </Card>
  );
};

export default AddExpenseForm;