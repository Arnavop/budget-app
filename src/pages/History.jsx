import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../hooks/useCurrency';

const History = () => {
  const { expenses, isLoading } = useExpenses();
  const { formatAmount } = useCurrency();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  useEffect(() => {
    if (!expenses || expenses.length === 0) {
      setFilteredExpenses([]);
      return;
    }
    
    let filtered = [...expenses];
    
    if (filter === 'settled') {
      filtered = filtered.filter(exp => exp.isSettled);
    } else if (filter === 'unsettled') {
      filtered = filtered.filter(exp => !exp.isSettled);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'desc'
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'amount') {
        return sortDirection === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount;
      } else {
        const descA = (a.description || '').toLowerCase();
        const descB = (b.description || '').toLowerCase();
        return sortDirection === 'desc'
          ? descB.localeCompare(descA)
          : descA.localeCompare(descB);
      }
    });
    
    setFilteredExpenses(filtered);
  }, [expenses, filter, sortBy, sortDirection]);
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const buttonStyles = {
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    border: 'none',
    fontSize: '14px'
  };

  const activeButtonStyles = {
    ...buttonStyles,
    backgroundColor: 'var(--accent)',
    color: 'white'
  };

  const inactiveButtonStyles = {
    ...buttonStyles,
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)'
  };

  return (
    <div className="container">
      <h1>Expense History</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            style={filter === 'all' ? activeButtonStyles : inactiveButtonStyles}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            style={filter === 'settled' ? activeButtonStyles : inactiveButtonStyles}
            onClick={() => setFilter('settled')}
          >
            Settled
          </button>
          <button 
            style={filter === 'unsettled' ? activeButtonStyles : inactiveButtonStyles}
            onClick={() => setFilter('unsettled')}
          >
            Unsettled
          </button>
        </div>
        
        <div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--bg-tertiary)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              marginRight: '10px'
            }}
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="description">Description</option>
          </select>
          
          <button 
            onClick={toggleSortDirection}
            style={inactiveButtonStyles}
          >
            {sortDirection === 'desc' ? '↓ Desc' : '↑ Asc'}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div>Loading expense history...</div>
      ) : filteredExpenses.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📜</div>
            <h3>No Expenses Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filter === 'all' 
                ? "You don't have any expenses yet." 
                : filter === 'settled' 
                  ? "You don't have any settled expenses."
                  : "You don't have any unsettled expenses."}
            </p>
          </div>
        </Card>
      ) : (
        <div>
          {filteredExpenses.map(expense => (
            <Card key={expense.id} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <h3 style={{ margin: '0', marginRight: '10px' }}>{expense.description}</h3>
                    {expense.isSettled && (
                      <span style={{ 
                        backgroundColor: 'var(--success-light)', 
                        color: 'var(--success)', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px' 
                      }}>
                        Settled
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
                    {expense.paidBy} • {formatDate(expense.date)} • {expense.category}
                  </p>
                </div>
                
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  {formatAmount(expense.amount)}
                </div>
              </div>
              
              <div style={{ marginTop: '15px', fontSize: '14px' }}>
                <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
                  Split with: {expense.splitWith.join(', ')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
