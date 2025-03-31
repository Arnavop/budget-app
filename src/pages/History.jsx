import React from 'react';
import Card from '../components/common/Card';
import { useExpenses } from '../hooks/useExpenses';

const History = () => {
  const { expenses, loading } = useExpenses();

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>History</h1>
      
      <Card>
        {loading ? (
          <p>Loading expense history...</p>
        ) : sortedExpenses.length === 0 ? (
          <p>No expenses found.</p>
        ) : (
          <div>
            {sortedExpenses.map(expense => (
              <div 
                key={expense.id} 
                style={{ 
                  padding: '15px 0',
                  borderBottom: '1px solid var(--bg-tertiary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0' }}>{expense.description}</h3>
                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)' }}>
                      {expense.paidBy} paid • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>${expense.amount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default History;
