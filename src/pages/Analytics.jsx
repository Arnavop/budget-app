import React from 'react';
import Card from '../components/common/Card';
import { useExpenses } from '../hooks/useExpenses';

const Analytics = () => {
  const { expenses } = useExpenses();

  // Calculate totals by category
  const getCategoryTotals = () => {
    const totals = {};
    expenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  };

  const categoryTotals = getCategoryTotals();
  const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Analytics</h1>
      
      <Card>
        <h2 style={{ marginBottom: '20px' }}>Expense Breakdown</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Total Spent: ${totalAmount.toFixed(2)}</h3>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '10px' }}>By Category</h3>
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <div 
              key={category} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--bg-tertiary)'
              }}
            >
              <div>{category}</div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div>${amount.toFixed(2)}</div>
                <div>{((amount / totalAmount) * 100).toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
