import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, loading, updateGroup, deleteGroup } = useGroups();
  const { expenses } = useExpenses();
  const [group, setGroup] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  
  useEffect(() => {
    if (!loading) {
      const foundGroup = groups.find(g => g.id === id);
      if (foundGroup) {
        setGroup(foundGroup);
        // Find expenses associated with this group
        const relatedExpenses = expenses.filter(exp => 
          foundGroup.expenses.includes(exp.id)
        );
        setGroupExpenses(relatedExpenses);
      } else {
        // Group not found, redirect
        navigate('/not-found');
      }
    }
  }, [id, groups, expenses, loading, navigate]);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteGroup(id);
      navigate('/groups');
    }
  };
  
  if (loading || !group) {
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
        <h1>
          <span style={{ marginRight: '10px', fontSize: '1.2em' }}>
            {group.icon}
          </span>
          {group.name}
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            text="Edit" 
            variant="secondary" 
            onClick={() => {/* Navigate to edit page */}}
          />
          <Button 
            text="Delete" 
            onClick={handleDelete}
            style={{ backgroundColor: 'var(--error)' }}
          />
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        <div>
          <Card>
            <h2 style={{ marginBottom: '15px' }}>Group Expenses</h2>
            {groupExpenses.length === 0 ? (
              <p>No expenses in this group yet.</p>
            ) : (
              groupExpenses.map(expense => (
                <div 
                  key={expense.id} 
                  style={{ 
                    padding: '15px 0',
                    borderBottom: '1px solid var(--bg-tertiary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/expenses/${expense.id}`)}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{expense.description}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {expense.paidBy} • {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <Button 
              text="Add Expense"
              style={{ marginTop: '20px' }}
              onClick={() => {/* Show expense form */}}
            />
          </Card>
        </div>
        
        <div>
          <Card>
            <h2 style={{ marginBottom: '15px' }}>Members</h2>
            {group.members.map((member, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '10px 0',
                  borderBottom: '1px solid var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}>
                  {member.charAt(0)}
                </div>
                <div>{member}</div>
              </div>
            ))}
            <Button 
              text="Add Member"
              style={{ marginTop: '20px' }}
              onClick={() => {/* Show add member form */}}
            />
          </Card>
          
          <Card>
            <h2 style={{ marginBottom: '15px' }}>Group Balance</h2>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--bg-tertiary)',
            }}>
              <div>Total Expenses</div>
              <div style={{ fontWeight: 'bold' }}>
                ${groupExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Button 
        text="Back to Groups" 
        variant="secondary"
        onClick={() => navigate('/groups')}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
};

export default GroupDetail;
