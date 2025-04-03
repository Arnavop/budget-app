import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useUsers } from '../../hooks/useUsers';
import usersService from '../../services/users';

const ManageMembers = () => {
  const { users, setUsers } = useUsers();
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter out the current user ("You") for display
  const otherMembers = users ? users.filter(user => user.name !== 'You') : [];

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!newMemberName.trim()) {
      setError('Please enter a valid name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call the service to add a new custom member
      await usersService.addCustomMember({ name: newMemberName });
      
      // Refresh the users list
      const updatedUsers = await usersService.getAll();
      setUsers(updatedUsers);
      
      // Clear the input
      setNewMemberName('');
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (userId) => {
    try {
      setLoading(true);
      
      // Call the service to delete the member
      await usersService.delete(userId);
      
      // Refresh the users list
      const updatedUsers = await usersService.getAll();
      setUsers(updatedUsers);
    } catch (err) {
      setError(err.message || 'Failed to delete member');
    } finally {
      setLoading(false);
    }
  };

  const cardHeaderStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px'
  };

  const memberListStyle = {
    marginTop: '25px'
  };

  const memberItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    marginBottom: '10px'
  };

  const formStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: '10px'
  };

  const memberInfoStyle = {
    display: 'flex',
    alignItems: 'center'
  };

  const deleteButtonStyle = {
    backgroundColor: 'var(--error)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  return (
    <Card>
      <div style={cardHeaderStyle}>Manage Members</div>
      
      <p style={{ color: 'var(--text-secondary)' }}>
        Add people you split expenses with. These members will be available when creating expenses.
      </p>
      
      <form onSubmit={handleAddMember} style={formStyle}>
        <Input
          type="text"
          placeholder="Enter name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          disabled={loading}
        />
        <Button
          type="submit"
          text={loading ? "Adding..." : "Add Member"}
          disabled={loading}
        />
      </form>
      
      {error && (
        <p style={{ color: 'var(--error)', marginTop: '10px' }}>{error}</p>
      )}
      
      <div style={memberListStyle}>
        <h3>Current Members</h3>
        
        {otherMembers.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            No members added yet. Add members above.
          </p>
        ) : (
          otherMembers.map(member => (
            <div key={member.id} style={memberItemStyle}>
              <div style={memberInfoStyle}>
                <div style={avatarStyle}>{member.avatar}</div>
                <div>
                  <div style={{ fontWeight: '500' }}>{member.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {member.email}
                  </div>
                </div>
              </div>
              <button 
                style={deleteButtonStyle}
                onClick={() => handleDeleteMember(member.id)}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ManageMembers;