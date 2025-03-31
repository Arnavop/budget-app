import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ExpenseItem from './ExpenseItem';
import { useExpenses } from '../../hooks/useExpenses';

const ExpenseList = () => {
  const { expenses, loading } = useExpenses();

  const cardTitleStyles = {
    fontSize: '18px', 
    marginBottom: '15px',  
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  };

  const expenseListStyles = {
    maxHeight: '400px',
    overflowY: 'auto',
  };

  return (
    <Card>
      <div style={cardTitleStyles}>
        Recent Expenses
        <Button 
          text="View All" 
          variant="text" 
        />
      </div>
      
      <div style={expenseListStyles}>
        {loading ? (
          <div>Loading...</div>
        ) : expenses.length === 0 ? (
          <div>No expenses found.</div>
        ) : (
          expenses.map(expense => (
            <ExpenseItem 
              key={expense.id} 
              expense={expense}
            />
          ))
        )}
      </div>
    </Card>
  );
};

export default ExpenseList;
