import React from 'react';
import Card from '../components/common/Card';
import { useGroups } from '../hooks/useGroups';

const Groups = () => {
  const { groups, loading } = useGroups();

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Groups</h1>
      
      {loading ? (
        <p>Loading groups...</p>
      ) : (
        groups.map(group => (
          <Card key={group.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                backgroundColor: 'var(--accent-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '20px' 
              }}>
                {group.icon}
              </div>
              <div>
                <h2 style={{ margin: '0' }}>{group.name}</h2>
                <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
                  {group.members.length} members
                </p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default Groups;
