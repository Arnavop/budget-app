import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock users data
  const mockUsers = [
    {
      id: '1',
      name: 'You',
      email: 'user@example.com',
      avatar: 'Y',
      color: 'var(--accent)'
    },
    {
      id: '2',
      name: 'Alex',
      email: 'alex@example.com',
      avatar: 'A',
      color: '#4285F4'
    },
    {
      id: '3',
      name: 'Sam',
      email: 'sam@example.com',
      avatar: 'S',
      color: '#EA4335'
    },
    {
      id: '4',
      name: 'Jordan',
      email: 'jordan@example.com',
      avatar: 'J',
      color: '#34A853'
    }
  ];

  useEffect(() => {
    // In a real app, this would fetch from an API
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const addUser = (user) => {
    setUsers([...users, { ...user, id: Date.now().toString() }]);
  };

  const updateUser = (id, updatedUser) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...updatedUser } : user
    ));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <UserContext.Provider value={{
      users,
      loading,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </UserContext.Provider>
  );
};
