import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ExpenseForm from '../components/expenses/ExpenseForm';
import { useExpenses } from '../hooks/useExpenses';

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenses, loading, deleteExpense } = useExpenses();
  const [expense, setExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      const foundExpense = expenses.find(exp => exp.id === id);
      if (foundExpense) {
        setExpense(foundExpense);
      } else {
        navigate('/not-found');
      }
    }
  }, [id, expenses, loading, navigate]);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      navigate('/');
    }
  };
  
  if (loading || !expense) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Expense Detail</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditing && (
            <>
              <Button 
                text="Edit" 
                variant="secondary" 
                onClick={() => setIsEditing(true)}
              />
              <Button 
                text="Delete" 
                onClick={handleDelete}
                style={{ backgroundColor: 'var(--error)' }}
              />
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <Card>
          <ExpenseForm 
            initialExpense={expense} 
            onSubmit={() => {
              setIsEditing(false);
              const updatedExpense = expenses.find(exp => exp.id === id);
              setExpense(updatedExpense);
            }}
          />
          <Button 
            text="Cancel" 
            variant="secondary"
            onClick={() => setIsEditing(false)}
            style={{ marginTop: '15px' }}
          />
        </Card>
      ) : (
        <Card>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--bg-tertiary)',
          }}>
            <div>
              <h2 style={{ marginBottom: '5px' }}>{expense.description}</h2>
              <div style={{ color: 'var(--text-secondary)' }}>
                {expense.paidBy} paid on {new Date(expense.date).toLocaleDateString()}
              </div>
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold' 
            }}>
              ${expense.amount.toFixed(2)}
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Category</div>
            <div>{expense.category}</div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Split With</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {expense.splitWith.map((person, index) => (
                <div 
                  key={index}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  {person}
                </div>
              ))}
            </div>
          </div>
          
          {expense.notes && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Notes</div>
              <div style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                padding: '10px', 
                borderRadius: '4px' 
              }}>
                {expense.notes}
              </div>
            </div>
          )}
        </Card>
      )}
      
      <Button 
        text="Back to Dashboard" 
        variant="secondary"
        onClick={() => navigate('/')}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
};

export default ExpenseDetail;
