import React, { createContext, useState, useEffect } from 'react';

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock groups data
  const mockGroups = [
    {
      id: '1',
      name: 'Apartment',
      icon: '🏠',
      members: ['You', 'Sam', 'Jordan'],
      expenses: ['4']
    },
    {
      id: '2',
      name: 'Vacation',
      icon: '🏖️',
      members: ['You', 'Alex', 'Sam', 'Jordan'],
      expenses: ['3']
    },
    {
      id: '3',
      name: 'Dinner Club',
      icon: '🍽️',
      members: ['You', 'Alex', 'Taylor'],
      expenses: ['1']
    },
  ];

  useEffect(() => {
    // In a real app, this would fetch from an API
    setGroups(mockGroups);
    setLoading(false);
  }, []);

  const addGroup = (group) => {
    const newGroup = {
      ...group,
      id: Date.now().toString(),
      expenses: []
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroup = (id, updatedGroup) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, ...updatedGroup } : group
    ));
  };

  const deleteGroup = (id) => {
    setGroups(groups.filter(group => group.id !== id));
  };

  return (
    <GroupContext.Provider value={{
      groups,
      loading,
      addGroup,
      updateGroup,
      deleteGroup
    }}>
      {children}
    </GroupContext.Provider>
  );
};
