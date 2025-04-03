import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useUsers } from '../../hooks/useUsers';

const CreateSettlementModal = ({ onClose, onCreateSettlement, balances = [] }) => {
  const { users } = useUsers();
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const usersYouOwe = users?.filter(user => {
    const balanceById = balances.find(b => b.userId === user.id);
    const balanceByName = balances.find(b => b.name === user.name);
    
    const balance = balanceById || balanceByName;
    return balance && balance.balance < 0;
  }) || [];
  
  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
    setError('');
    
    if (e.target.value) {
      let userBalance = balances.find(b => b.userId === e.target.value);
      
      if (!userBalance) {
        const selectedUser = users.find(u => u.id === e.target.value);
        if (selectedUser) {
          userBalance = balances.find(b => b.name === selectedUser.name);
        }
      }
      
      if (userBalance) {
        setAmount(Math.abs(userBalance.balance).toFixed(2));
      }
    }
  };
  
  const handleCreateSettlement = async (e) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      await onCreateSettlement(selectedUserId, parseFloat(amount));
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to create settlement');
      setLoading(false);
    }
  };
  
  const selectStyles = {
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid var(--bg-tertiary)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    width: '100%',
    marginBottom: '15px',
  };
  
  const errorStyles = {
    color: '#f44336',
    marginBottom: '15px',
  };
  
  return (
    <Modal title="Create Settlement" onClose={onClose}>
      <form onSubmit={handleCreateSettlement}>
        <div>
          <label>Pay To</label>
          <select
            value={selectedUserId}
            onChange={handleUserChange}
            style={selectStyles}
            disabled={loading}
          >
            <option value="">Select a person</option>
            {usersYouOwe.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label>Amount ($)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            disabled={loading}
            required
            step="0.01"
            min="0.01"
          />
        </div>
        
        {error && <div style={errorStyles}>{error}</div>}
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button
            text="Cancel"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            type="submit"
            text={loading ? 'Creating...' : 'Create Settlement'}
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateSettlementModal;