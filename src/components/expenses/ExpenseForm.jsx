import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useExpenses } from '../../hooks/useExpenses';
import { useUsers } from '../../hooks/useUsers';

const ExpenseForm = ({ onSubmit, initialExpense }) => {
  const { addExpense, updateExpense } = useExpenses();
  const { users } = useUsers();
  
  const [description, setDescription] = useState(initialExpense?.description || '');
  const [amount, setAmount] = useState(initialExpense?.amount?.toString() || '');
  const [date, setDate] = useState(initialExpense?.date ? 
    new Date(initialExpense.date).toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0]
  );
  const [paidBy, setPaidBy] = useState(initialExpense?.paidBy || 'You');
  const [category, setCategory] = useState(initialExpense?.category || 'Food');
  const [splitMethod, setSplitMethod] = useState(initialExpense?.splitMethod || 'Equal');
  const [notes, setNotes] = useState(initialExpense?.notes || '');
  
  const [selectedMembers, setSelectedMembers] = useState(
    initialExpense?.splitWith || users.filter(u => u.name !== 'You').map(u => u.name)
  );

  const inputGroupStyles = {
    position: 'relative',
    marginBottom: '15px',
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '5px',
  };

  const selectStyles = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid var(--bg-tertiary)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
  };

  const textareaStyles = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid var(--bg-tertiary)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '80px',
  };

  const membersListStyles = {
    border: '1px solid var(--bg-tertiary)',
    borderRadius: '4px',
    margin: '10px 0',
    maxHeight: '150px',
    overflowY: 'auto',
  };

  const memberItemStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    gap: '10px',
    borderBottom: '1px solid var(--bg-tertiary)',
  };

  const fileUploadStyles = {
    border: '2px dashed var(--bg-tertiary)',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    margin: '15px 0',
    cursor: 'pointer',
  };

  const fileUploadIconStyles = {
    fontSize: '24px',
    marginBottom: '10px',
    color: 'var(--text-secondary)',
  };

  const fileUploadTextStyles = {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    marginTop: '5px',
  };

  const personAvatarStyles = (color) => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '12px',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const expenseData = {
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      paidBy,
      splitWith: selectedMembers,
      splitMethod: splitMethod.toLowerCase(),
      category,
      notes
    };
    
    if (initialExpense?.id) {
      updateExpense(initialExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    
    if (onSubmit) onSubmit();
  };

  const toggleMember = (userName) => {
    setSelectedMembers(prev => {
      if (prev.includes(userName)) {
        return prev.filter(name => name !== userName);
      } else {
        return [...prev, userName];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={inputGroupStyles}>
        <label style={labelStyles}>Description</label>
        <Input
          type="text"
          placeholder="What was this expense for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      
      <div style={inputGroupStyles}>
        <label style={labelStyles}>Amount</label>
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      
      <div style={inputGroupStyles}>
        <label style={labelStyles}>Date</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      
      <div style={inputGroupStyles}>
        <label style={labelStyles}>Paid by</label>
        <select 
          style={selectStyles} 
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          {users.map(user => (
            <option key={user.id} value={user.name}>{user.name}</option>
          ))}
        </select>
      </div>
      
      <div style={inputGroupStyles}>
        <label style={labelStyles}>Category</label>
        <select 
          style={selectStyles} 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Utilities">Utilities</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div style={inputGroupStyles}>
        <label style={labelStyles}>Split method</label>
        <select 
          style={selectStyles} 
          value={splitMethod}
          onChange={(e) => setSplitMethod(e.target.value)}
        >
          <option value="Equal">Equal</option>
          <option value="Exact amounts">Exact amounts</option>
          <option value="Percentages">Percentages</option>
          <option value="Shares">Shares</option>
        </select>
      </div>
      
      <div style={inputGroupStyles}>
        <label style={labelStyles}>Split with</label>
        <div style={membersListStyles}>
          {users.filter(user => user.name !== paidBy).map(user => (
            <div key={user.id} style={memberItemStyles}>
              <input 
                type="checkbox" 
                checked={selectedMembers.includes(user.name)}
                onChange={() => toggleMember(user.name)}
                style={{ width: 'auto' }}
              />
              <div style={personAvatarStyles(user.color)}>{user.avatar}</div>
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={inputGroupStyles}>
        <label style={labelStyles}>Notes</label>
        <textarea 
          style={textareaStyles}
          placeholder="Any additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <div style={fileUploadStyles}>
        <div style={fileUploadIconStyles}>📷</div>
        <div>Attach Receipt</div>
        <div style={fileUploadTextStyles}>Click to upload or drag and drop</div>
      </div>
      
      <Button 
        text={initialExpense ? "Update Expense" : "Save Expense"}
        style={{ marginTop: '20px' }}
        type="submit"
      />
    </form>
  );
};

export default ExpenseForm;
