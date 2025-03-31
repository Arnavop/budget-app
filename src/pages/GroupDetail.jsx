import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useGroups } from '../hooks/useGroups';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import activities from '../services/activities';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGroupById, updateGroup, deleteGroup, addMember, removeMember } = useGroups();
  const { users } = useUsers();
  const { currentUser } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedIcon, setEditedIcon] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  
  // Array of available icons to choose from
  const [availableIcons] = useState(['👥', '🏠', '🍔', '🍕', '🎮', '🏄', '👨‍👩‍👧‍👦', '💼', '🏝️', '🚗', '💰', '🎓']);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        setLoading(true);
        const groupData = await getGroupById(id);
        
        if (!groupData) {
          setError('Group not found');
          return;
        }
        
        setGroup(groupData);
        setEditedName(groupData.name);
        setEditedIcon(groupData.icon || '👥');
        
        // Calculate available members to add (those not already in the group)
        if (users) {
          const notInGroup = users
            .filter(user => user.name !== 'You' && !groupData.members.includes(user.name))
            .map(user => user.name);
          setAvailableMembers(notInGroup);
        }
      } catch (error) {
        console.error('Error loading group:', error);
        setError('Failed to load group details');
      } finally {
        setLoading(false);
      }
    };
    
    loadGroup();
    
    // Listen for group update events
    const handleGroupUpdate = (event) => {
      const updatedGroup = event.detail;
      if (updatedGroup.id === id) {
        setGroup(updatedGroup);
        setEditedName(updatedGroup.name);
        setEditedIcon(updatedGroup.icon || '👥');
        
        // Update available members
        if (users) {
          const notInGroup = users
            .filter(user => user.name !== 'You' && !updatedGroup.members.includes(user.name))
            .map(user => user.name);
          setAvailableMembers(notInGroup);
        }
      }
    };
    
    window.addEventListener('groupUpdated', handleGroupUpdate);
    window.addEventListener('groupMemberAdded', handleGroupUpdate);
    window.addEventListener('groupMemberRemoved', handleGroupUpdate);
    
    return () => {
      window.removeEventListener('groupUpdated', handleGroupUpdate);
      window.removeEventListener('groupMemberAdded', handleGroupUpdate);
      window.removeEventListener('groupMemberRemoved', handleGroupUpdate);
    };
  }, [id, getGroupById, users]);

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      setError('Group name cannot be empty');
      return;
    }
    
    try {
      const updatedGroup = await updateGroup(id, {
        name: editedName.trim(),
        icon: editedIcon
      });
      
      // Create activity
      await activities.create({
        action: 'updated',
        resourceType: 'group',
        resourceId: id,
        metadata: {
          name: updatedGroup.name
        }
      });
      
      setGroup(updatedGroup);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(group.name);
    setEditedIcon(group.icon || '👥');
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await deleteGroup(id);
        
        // Create activity
        await activities.create({
          action: 'deleted',
          resourceType: 'group',
          resourceId: id,
          metadata: {
            name: group.name
          }
        });
        
        navigate('/dashboard/groups');
      } catch (error) {
        console.error('Error deleting group:', error);
        setError('Failed to delete group');
      }
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName) {
      setError('Please select a member to add');
      return;
    }
    
    try {
      await addMember(id, newMemberName);
      
      // Create activity for adding member
      await activities.create({
        action: 'added_member',
        resourceType: 'group',
        resourceId: id,
        metadata: {
          name: group.name,
          member: newMemberName
        }
      });
      
      setNewMemberName('');
      setIsAddingMember(false);
      setError(null);
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberName) => {
    if (memberName === 'You') {
      setError('You cannot remove yourself from the group');
      return;
    }
    
    if (window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
      try {
        await removeMember(id, memberName);
        
        // Create activity for removing member
        await activities.create({
          action: 'removed_member',
          resourceType: 'group',
          resourceId: id,
          metadata: {
            name: group.name,
            member: memberName
          }
        });
        
        setError(null);
      } catch (error) {
        console.error('Error removing member:', error);
        setError('Failed to remove member');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1>Loading group details...</h1>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="container">
        <h1>Error</h1>
        <div style={{ color: 'red' }}>{error}</div>
        <Button text="Back to Groups" onClick={() => navigate('/dashboard/groups')} />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container">
        <h1>Group not found</h1>
        <Button text="Back to Groups" onClick={() => navigate('/dashboard/groups')} />
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <Button 
          text="← Back to Groups" 
          onClick={() => navigate('/dashboard/groups')}
          variant="text"
        />
        
        {!isEditing ? (
          <div>
            <Button 
              text="Edit" 
              onClick={() => setIsEditing(true)}
              style={{ marginRight: '10px' }}
            />
            <Button 
              text="Delete Group" 
              variant="danger"
              onClick={handleDelete}
            />
          </div>
        ) : (
          <div>
            <Button 
              text="Cancel" 
              variant="secondary"
              onClick={handleCancelEdit}
              style={{ marginRight: '10px' }}
            />
            <Button 
              text="Save Changes" 
              onClick={handleSaveEdit}
            />
          </div>
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
      
      <Card>
        {isEditing ? (
          <div>
            <h2>Edit Group</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Group Name</label>
              <Input
                type="text"
                placeholder="Enter group name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
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
                    onClick={() => setEditedIcon(icon)}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      border: icon === editedIcon ? '2px solid var(--accent)' : '1px solid var(--bg-tertiary)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              fontSize: '48px',
              marginRight: '20px'
            }}>
              {group.icon}
            </div>
            <div>
              <h1 style={{ margin: '0 0 5px 0' }}>{group.name}</h1>
              <div style={{ color: 'var(--text-secondary)' }}>
                {group.members.length} members
              </div>
            </div>
          </div>
        )}
      </Card>
      
      <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>Members</h2>
      
      <Card>
        {/* Header with Add Member button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: 0 }}>Group Members</h3>
          {!isAddingMember ? (
            <Button 
              text="+ Add Member" 
              onClick={() => setIsAddingMember(true)}
              disabled={availableMembers.length === 0}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--bg-tertiary)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <option value="">Select member</option>
                {availableMembers.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <Button 
                text="Add" 
                onClick={handleAddMember}
                disabled={!newMemberName}
              />
              <Button 
                text="Cancel" 
                variant="secondary"
                onClick={() => {
                  setIsAddingMember(false);
                  setNewMemberName('');
                }}
              />
            </div>
          )}
        </div>
        
        {/* Members list */}
        <div>
          {group.members.map((member, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: index < group.members.length - 1 ? '1px solid var(--bg-tertiary)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  fontWeight: 'bold'
                }}>
                  {member.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: member === 'You' ? 'bold' : 'normal' }}>
                    {member}
                    {member === 'You' && ' (you)'}
                  </div>
                </div>
              </div>
              
              {member !== 'You' && (
                <Button 
                  text="Remove" 
                  variant="danger"
                  onClick={() => handleRemoveMember(member)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default GroupDetail;
