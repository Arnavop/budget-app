import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import IconButton from '../common/IconButton';
import { useExpenses } from '../../hooks/useExpenses';

const AddExpenseForm = ({ onShowFullForm }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You paid');
  const { addExpense } = useExpenses();

  const expenseFormStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 120px 60px',
    gap: '10px',
    marginBottom: '20px',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!description || !amount) return;
    
    addExpense({
      description,
      amount: parseFloat(amount),
      paidBy: paidBy.split(' ')[0],
      date: new Date(),
      splitWith: ['Alex', 'Sam', 'Jordan'],
      splitMethod: 'equally',
      category: 'Other'
    });
    
    setDescription('');
    setAmount('');
    setPaidBy('You paid');
  };

  const cardTitleStyles = {
    fontSize: '18px', 
    marginBottom: '15px',  
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center'
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
        />
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select 
          value={paidBy} 
          onChange={(e) => setPaidBy(e.target.value)}
          style={selectStyles}
        >
          <option>You paid</option>
          <option>Alex paid</option>
          <option>Sam paid</option>
          <option>Jordan paid</option>
        </select>
        <IconButton 
          icon="+" 
          onClick={handleSubmit}
        />
      </form>
    </Card>
  );
};

export default AddExpenseForm;
