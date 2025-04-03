import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useExpenses } from '../../hooks/useExpenses';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { GroupContext } from '../../contexts/GroupContext';
import { useContext } from 'react';
import activities from '../../services/activities';

// Keep these for analytics since they're separate from expense storage
const ANALYTICS_STATS_KEY = 'analyticsStats';
const ANALYTICS_TIMESTAMP_KEY = 'analyticsTimestamp';

const AddExpenseForm = ({ onShowFullForm }) => {
  const { addExpense } = useExpenses();
  const { users } = useUsers();
  const { currentUser } = useAuth();
  const { groups } = useContext(GroupContext);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You paid');
  const [category, setCategory] = useState('Food');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get the selected group object
  const selectedGroup = selectedGroupId ? groups.find(group => group.id === selectedGroupId) : null;
  
  // Effect to reset paidBy when group changes
  useEffect(() => {
    setPaidBy('You paid');
  }, [selectedGroupId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    try {
      setLoading(true);
      
      // Extract the person who paid (remove " paid" suffix)
      const payer = paidBy.replace(' paid', '');
      
      // Determine split users based on selected group or individual users
      let splitWithUsers;
      
      if (selectedGroup) {
        // If a group is selected, use group members excluding the payer
        splitWithUsers = selectedGroup.members.filter(member => member !== payer);
      } else if (payer === 'You') {
        // If you paid and no group selected, split with all other users
        splitWithUsers = users ? 
          users.filter(user => user.name !== 'You').map(user => user.name) : 
          []; // Empty array if no users loaded
      } else {
        // If someone else paid and no group selected, include yourself in split
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
        groupId: selectedGroupId || null, // Associate with group if selected
      });

      // Create activity record for the new expense
      await activities.create({
        action: 'created',
        resourceType: 'expense',
        resourceId: newExpense.id,
        metadata: {
          description,
          amount: parseFloat(amount),
          groupId: selectedGroupId || null,
          groupName: selectedGroup ? selectedGroup.name : null
        }
      });
      
      // Update analytics data with the new expense
      updateAnalyticsData(newExpense);
      
      // Dispatch custom event to notify ExpenseList and Analytics component
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

  const updateAnalyticsData = (newExpense) => {
    try {
      // Get existing analytics data from localStorage
      const storedStats = localStorage.getItem(ANALYTICS_STATS_KEY);
      
      if (!storedStats) {
        // If no analytics data exists yet, we'll let the Analytics component handle it
        return;
      }
      
      const stats = JSON.parse(storedStats);
      
      // 1. Update daily spending data
      const expenseDate = new Date(newExpense.date).toISOString().split('T')[0];
      const dailySpendingEntry = stats.dailySpending.find(entry => entry.date === expenseDate);
      
      if (dailySpendingEntry) {
        dailySpendingEntry.amount += parseFloat(newExpense.amount);
      }
      
      // 2. Update category data
      const categoryEntry = stats.categories.find(cat => cat.name === newExpense.category);
      
      if (categoryEntry) {
        // Update existing category
        categoryEntry.amount += parseFloat(newExpense.amount);
      } else {
        // Add new category with default color
        const categoryColors = {
          'Food': '#4CAF50',
          'Transport': '#2196F3',
          'Entertainment': '#FF9800',
          'Utilities': '#9C27B0',
          'Other': '#607D8B'
        };
        
        stats.categories.push({
          name: newExpense.category,
          amount: parseFloat(newExpense.amount),
          percentage: 0, // Will be recalculated below
          color: categoryColors[newExpense.category] || '#607D8B'
        });
      }
      
      // 3. Update summary statistics
      stats.summary.totalSpent += parseFloat(newExpense.amount);
      stats.summary.avgPerDay = stats.summary.totalSpent / 30;
      
      if (dailySpendingEntry && dailySpendingEntry.amount > stats.summary.maxDay) {
        stats.summary.maxDay = dailySpendingEntry.amount;
      }
      
      // 4. Recalculate category percentages
      stats.categories.forEach(category => {
        category.percentage = Math.round((category.amount / stats.summary.totalSpent) * 100) || 0;
      });
      
      // 5. Save updated analytics data back to localStorage
      localStorage.setItem(ANALYTICS_STATS_KEY, JSON.stringify(stats));
      localStorage.setItem(ANALYTICS_TIMESTAMP_KEY, new Date().getTime().toString());
    } catch (error) {
      console.error('Error updating analytics data:', error);
      // If there's an error updating analytics data, 
      // we'll just let the Analytics component refresh it completely
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
    const user = users?.find(u => u.name === userName);
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
  
  // Determine who can pay based on the selected group or available users
  const getPayers = () => {
    if (selectedGroup) {
      return selectedGroup.members;
    } else {
      // If no group selected, use available users
      return users ? 
        ['You', ...users.filter(user => user.name !== 'You').map(user => user.name)] : 
        ['You'];
    }
  };
  
  // Get payers for the dropdown
  const payers = getPayers();
  
  // Display a message if no members are available for splitting
  const noMembers = !users || (users.filter(user => user.name !== 'You').length === 0 && groups.length === 0);
  // No group members if a group is selected but has only one member (you)
  const noGroupMembers = selectedGroup && selectedGroup.members.length <= 1;

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
      
      {noMembers ? (
        <div style={{ textAlign: 'center', padding: '15px', color: 'var(--text-secondary)' }}>
          <p>No members available to split expenses with.</p>
          <p>Go to Settings → Manage Members to add people.</p>
          <Button 
            text="Go to Settings" 
            onClick={() => window.location.href = '/settings'}
            style={{ marginTop: '10px' }}
          />
        </div>
      ) : (
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
          
          {/* Group selector */}
          <select 
            value={selectedGroupId} 
            onChange={(e) => setSelectedGroupId(e.target.value)}
            style={selectStyles}
            disabled={loading}
          >
            <option value="">No group (individual expense)</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          
          {noGroupMembers ? (
            <div style={{ padding: '10px', color: 'var(--error)', fontSize: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
              Selected group doesn't have enough members to split expenses.
            </div>
          ) : null}
          
          <select 
            value={paidBy} 
            onChange={(e) => setPaidBy(e.target.value)}
            style={selectStyles}
            disabled={loading}
          >
            {payers.map(payer => (
              <option key={payer}>{payer === 'You' ? 'You paid' : `${payer} paid`}</option>
            ))}
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
            disabled={loading || noGroupMembers}
          />
          
          {selectedGroup && (
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
              This expense will be split among: {selectedGroup.members.join(', ')}
            </div>
          )}
        </form>
      )}
    </Card>
  );
};

export default AddExpenseForm;