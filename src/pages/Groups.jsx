import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useGroups } from '../hooks/useGroups';
import { useUsers } from '../hooks/useUsers';
import activities from '../services/activities';

const Groups = () => {
  const navigate = useNavigate();
  const { groups, isLoading, addGroup } = useGroups();
  const { users } = useUsers();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('👥');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState(null);
  const [availableIcons] = useState(['👥', '🏠', '🍔', '🍕', '🎮', '🏄', '👨‍👩‍👧‍👦', '💼', '🏝️', '🚗', '💰', '🎓']);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!newGroupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    try {
      const newGroup = await addGroup({
        name: newGroupName.trim(),
        icon: newGroupIcon,
        members: selectedMembers
      });
      
      await activities.create({
        action: 'created',
        resourceType: 'group',
        resourceId: newGroup.id,
        metadata: {
          name: newGroup.name
        }
      });
      
      setNewGroupName('');
      setNewGroupIcon('👥');
      setSelectedMembers([]);
      setIsCreatingGroup(false);
      
      navigate(`/dashboard/groups/${newGroup.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    }
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
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Groups</h1>
        {!isCreatingGroup && (
          <Button 
            text="+ Create Group" 
            onClick={() => setIsCreatingGroup(true)} 
          />
        )}
      </div>
      
      {error && (
        <div style={{
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          color: 'red',
          padding: '10px 15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {isCreatingGroup && (
        <Card>
          <h2>Create New Group</h2>
          <form onSubmit={handleCreateGroup} style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Group Name</label>
              <Input
                type="text"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Group Icon</label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {availableIcons.map((icon, index) => (
                  <div
                    key={index}
                    onClick={() => setNewGroupIcon(icon)}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      border: icon === newGroupIcon ? '2px solid var(--accent)' : '1px solid var(--bg-tertiary)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Add Members</label>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid var(--bg-tertiary)',
                borderRadius: '4px',
                padding: '5px 0'
              }}>
                {users && users
                  .filter(user => user.name !== 'You')
                  .map(user => (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 15px',
                        borderBottom: '1px solid var(--bg-tertiary)'
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedMembers.includes(user.name)}
                        onChange={() => toggleMember(user.name)}
                        style={{ marginRight: '10px' }}
                      />
                      <label 
                        htmlFor={`user-${user.id}`}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: user.color || 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          marginRight: '10px'
                        }}>
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </label>
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" text="Create Group" />
              <Button 
                type="button" 
                text="Cancel" 
                variant="secondary" 
                onClick={() => {
                  setIsCreatingGroup(false);
                  setNewGroupName('');
                  setNewGroupIcon('👥');
                  setSelectedMembers([]);
                  setError(null);
                }} 
              />
            </div>
          </form>
        </Card>
      )}
      
      {!isCreatingGroup && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {isLoading ? (
            <div>Loading groups...</div>
          ) : groups.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0' }}>
              <p>You don't have any groups yet. Create your first group to get started!</p>
            </div>
          ) : (
            groups.map(group => (
              <Card key={group.id} onClick={() => navigate(`/dashboard/groups/${group.id}`)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    fontSize: '36px',
                    marginRight: '15px'
                  }}>
                    {group.icon}
                  </div>
                  <div>
                    <h2 style={{ margin: 0 }}>{group.name}</h2>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {group.members.length} members
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 10px 0' }}>Members</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {group.members.slice(0, 5).map((member, idx) => (
                      <div key={idx} style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {member}
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        +{group.members.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  text="View Details" 
                  style={{ width: '100%' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/groups/${group.id}`);
                  }}
                />
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Groups;
