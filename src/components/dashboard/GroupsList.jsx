import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useGroups } from '../../hooks/useGroups';

const GroupsList = () => {
  const { groups, loading } = useGroups();
  const navigate = useNavigate();

  const cardTitleStyles = {
    fontSize: '18px', 
    marginBottom: '15px'
  };

  const groupsListStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '15px',
  };

  const groupPillStyles = {
    backgroundColor: 'rgba(3, 218, 198, 0.2)',
    borderRadius: '20px',
    padding: '5px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  };

  const groupAvatarStyles = {
    width: '24px',
    height: '24px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '12px',
  };

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <Card>
      <div style={cardTitleStyles}>Groups</div>
      
      <div style={groupsListStyles}>
        {loading ? (
          <div>Loading...</div>
        ) : groups.length === 0 ? (
          <div>No groups found.</div>
        ) : (
          groups.map(group => (
            <div 
              key={group.id} 
              style={groupPillStyles}
              onClick={() => handleGroupClick(group.id)}
            >
              <div style={groupAvatarStyles}>{group.icon}</div>
              <span>{group.name}</span>
            </div>
          ))
        )}
      </div>
      
      <Button 
        text="+ Create New Group" 
        onClick={() => navigate('/groups/new')}
      />
    </Card>
  );
};

export default GroupsList;
