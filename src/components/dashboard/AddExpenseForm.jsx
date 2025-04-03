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
  
  const selectedGroup = selectedGroupId ? groups.find(group => group.id === selectedGroupId) : null;
  
  useEffect(() => {
    setPaidBy('You paid');
  }, [selectedGroupId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    try {
      setLoading(true);
      
      const payer = paidBy.replace(' paid', '');
      
      let splitWithUsers;
      
      if (selectedGroup) {
        splitWithUsers = selectedGroup.members.filter(member => member !== payer);
      } else if (payer === 'You') {
        splitWithUsers = users ? 
          users.filter(user => user.name !== 'You').map(user => user.name) : 
          [];
      } else {
        splitWithUsers = users ?
          users.filter(user => user.name !== payer && user.name !== 'You')
            .map(user => user.name)
            .concat(['You']) :
          ['You'];
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
        groupId: selectedGroupId || null,
      });

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
      
      updateAnalyticsData(newExpense);
      
      dispatchExpenseAddedEvent(newExpense);
      
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
      const storedStats = localStorage.getItem(ANALYTICS_STATS_KEY);
      
      if (!storedStats) {
        return;
      }
      
      const stats = JSON.parse(storedStats);
      
      const expenseDate = new Date(newExpense.date).toISOString().split('T')[0];
      const dailySpendingEntry = stats.dailySpending.find(entry => entry.date === expenseDate);
      
      if (dailySpendingEntry) {
        dailySpendingEntry.amount += parseFloat(newExpense.amount);
      }
      
      const categoryEntry = stats.categories.find(cat => cat.name === newExpense.category);
      
      if (categoryEntry) {
        categoryEntry.amount += parseFloat(newExpense.amount);
      } else {
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
          percentage: 0,
          color: categoryColors[newExpense.category] || '#607D8B'
        });
      }
      
      stats.summary.totalSpent += parseFloat(newExpense.amount);
      stats.summary.avgPerDay = stats.summary.totalSpent / 30;
      
      if (dailySpendingEntry && dailySpendingEntry.amount > stats.summary.maxDay) {
        stats.summary.maxDay = dailySpendingEntry.amount;
      }
      
      stats.categories.forEach(category => {
        category.percentage = Math.round((category.amount / stats.summary.totalSpent) * 100) || 0;
      });
      
      localStorage.setItem(ANALYTICS_STATS_KEY, JSON.stringify(stats));
      localStorage.setItem(ANALYTICS_TIMESTAMP_KEY, new Date().getTime().toString());
    } catch (error) {
      console.error('Error updating analytics data:', error);
    }
  };
  
  const dispatchExpenseAddedEvent = (expense) => {
    const event = new CustomEvent('expenseAdded', { 
      detail: expense 
    });
    window.dispatchEvent(event);
  };

  const getUserId = (userName) => {
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
  
  const getPayers = () => {
    if (selectedGroup) {
      return selectedGroup.members;
    } else {
      return users ? 
        ['You', ...users.filter(user => user.name !== 'You').map(user => user.name)] : 
        ['You'];
    }
  };
  
  const payers = getPayers();
  
  const noMembers = !users || (users.filter(user => user.name !== 'You').length === 0 && groups.length === 0);
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