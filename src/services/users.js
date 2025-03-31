// Mock implementation of users service

// Mock users data
let usersData = [
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

const users = {
  getAll: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...usersData]);
      }, 300);
    });
  },
  
  getById: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usersData.find(u => u.id === id);
        if (user) {
          resolve({...user});
        } else {
          reject(new Error('User not found'));
        }
      }, 200);
    });
  },
  
  getByEmail: async (email) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usersData.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          resolve({...user});
        } else {
          reject(new Error('User not found'));
        }
      }, 200);
    });
  },
  
  create: async (userData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date(),
          avatar: userData.name.charAt(0).toUpperCase(),
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
        usersData = [...usersData, newUser];
        resolve(newUser);
      }, 300);
    });
  },
  
  update: async (id, userData) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = usersData.findIndex(u => u.id === id);
        if (index !== -1) {
          const updatedUser = {
            ...usersData[index],
            ...userData,
            updatedAt: new Date()
          };
          usersData[index] = updatedUser;
          resolve(updatedUser);
        } else {
          reject(new Error('User not found'));
        }
      }, 300);
    });
  },
  
  delete: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = usersData.length;
        usersData = usersData.filter(u => u.id !== id);
        
        if (usersData.length < initialLength) {
          resolve({ success: true });
        } else {
          reject(new Error('User not found'));
        }
      }, 200);
    });
  },
  
  search: async (query) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = usersData.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  }
};

export default users;
