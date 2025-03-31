import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';
import groups from '../../services/groups';

const GroupsList = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const loadGroups = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Use our groups service which now uses localStorage
      const data = await groups.getAll();
      setUserGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [currentUser]);
  
  // Listen for custom events for real-time updates
  useEffect(() => {
    // Handler for new group added
    const handleGroupAdded = (event) => {
      const newGroup = event.detail;
      setUserGroups(prev => {
        // Only add if not already in the list
        if (!prev.some(group => group.id === newGroup.id)) {
          return [...prev, newGroup];
        }
        return prev;
      });
    };
    
    // Handler for group updated
    const handleGroupUpdated = (event) => {
      const updatedGroup = event.detail;
      setUserGroups(prev => 
        prev.map(group => group.id === updatedGroup.id ? updatedGroup : group)
      );
    };
    
    // Handler for group deleted
    const handleGroupDeleted = (event) => {
      const { id } = event.detail;
      setUserGroups(prev => prev.filter(group => group.id !== id));
    };
    
    // Handler for member added to group
    const handleMemberAdded = (event) => {
      const { group } = event.detail;
      setUserGroups(prev => 
        prev.map(g => g.id === group.id ? group : g)
      );
    };
    
    // Handler for member removed from group
    const handleMemberRemoved = (event) => {
      const { group } = event.detail;
      setUserGroups(prev => 
        prev.map(g => g.id === group.id ? group : g)
      );
    };
    
    // Add event listeners
    window.addEventListener('groupAdded', handleGroupAdded);
    window.addEventListener('groupUpdated', handleGroupUpdated);
    window.addEventListener('groupDeleted', handleGroupDeleted);
    window.addEventListener('groupMemberAdded', handleMemberAdded);
    window.addEventListener('groupMemberRemoved', handleMemberRemoved);
    
    // Cleanup
    return () => {
      window.removeEventListener('groupAdded', handleGroupAdded);
      window.removeEventListener('groupUpdated', handleGroupUpdated);
      window.removeEventListener('groupDeleted', handleGroupDeleted);
      window.removeEventListener('groupMemberAdded', handleMemberAdded);
      window.removeEventListener('groupMemberRemoved', handleMemberRemoved);
    };
  }, []);

  return (
    <Card>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: 'bold',
        marginBottom: '15px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        Your Groups
        <button
          onClick={() => navigate('/dashboard/groups')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + New
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading groups...</div>
      ) : userGroups.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: 'var(--text-secondary)'
        }}>
          You're not in any groups yet.
        </div>
      ) : (
        <div>
          {userGroups.map(group => (
            <div 
              key={group.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '10px',
                backgroundColor: 'var(--bg-secondary)',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/dashboard/groups/${group.id}`)}
            >
              <div style={{
                fontSize: '24px',
                marginRight: '15px'
              }}>
                {group.icon}
              </div>
              <div>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {group.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  {group.members.length} members
                </div>
              </div>
            </div>
          ))}
          
          <div style={{
            textAlign: 'center',
            marginTop: '15px'
          }}>
            <button
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={() => navigate('/dashboard/groups')}
            >
              View All Groups
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GroupsList;
