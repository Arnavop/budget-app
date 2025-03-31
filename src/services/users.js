// users.js - using mock data
import { mockUsers, mockSettlements, generateId } from './mockData';
import { auth } from './auth';

// In-memory storage to simulate a database
let usersData = [...mockUsers];
let settlementsData = [...mockSettlements];

const users = {
  getAll: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Return all users, with current user marked as "You"
      return usersData.map(user => ({
        ...user,
        name: user.id === currentUser.id ? 'You' : user.name
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const user = usersData.find(u => u.id === id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const currentUser = await auth.getCurrentUser();
      const isCurrentUser = currentUser && currentUser.id === id;
      
      return {
        ...user,
        name: isCurrentUser ? 'You' : user.name
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const user = usersData.find(u => u.id === currentUser.id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        ...user,
        name: 'You',
        originalName: user.name
      };
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  },
  
  create: async (userData) => {
    try {
      const newUser = {
        id: generateId('user'),
        name: userData.name,
        email: userData.email,
        color: userData.color || 'blue',
        avatar: userData.name.charAt(0).toUpperCase(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      usersData.push(newUser);
      
      return newUser;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },
  
  update: async (id, userData) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Make sure the user is only updating their own profile
      if (id !== currentUser.id) throw new Error('Not authorized to update this profile');
      
      const userIndex = usersData.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user
      const updatedUser = {
        ...usersData[userIndex],
        name: userData.name,
        color: userData.color,
        updatedAt: new Date()
      };
      
      usersData[userIndex] = updatedUser;
      
      return {
        ...updatedUser,
        name: 'You',
        originalName: updatedUser.name
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    throw new Error('Account deletion must be performed through auth service');
  },
  
  getUserBalance: async (userId) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const targetUserId = userId || currentUser.id;
      
      // For mock data, use a random balance amount between -100 and 100
      const balance = Math.floor(Math.random() * 200) - 100;
      
      return {
        userId: targetUserId,
        balance,
        isYou: targetUserId === currentUser.id
      };
    } catch (error) {
      console.error('Error calculating user balance:', error);
      throw error;
    }
  },
  
  getAllBalances: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Generate mock balances for all users
      const balances = usersData.map(user => {
        const balance = user.id === currentUser.id ? 0 : (Math.floor(Math.random() * 200) - 100);
        return {
          userId: user.id,
          name: user.id === currentUser.id ? 'You' : user.name,
          balance
        };
      });
      
      return balances;
    } catch (error) {
      console.error('Error calculating all user balances:', error);
      throw error;
    }
  },
  
  getSettlements: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Return settlements where the current user is involved
      return settlementsData.filter(settlement => 
        settlement.fromUserId === currentUser.id || settlement.toUserId === currentUser.id
      );
    } catch (error) {
      console.error('Error fetching settlements:', error);
      throw error;
    }
  },
  
  createSettlement: async (fromUserId, toUserId, amount) => {
    try {
      const newSettlement = {
        id: generateId('settlement'),
        fromUserId,
        toUserId,
        amount,
        date: new Date(),
        completed: false,
        fromUser: fromUserId === 'user-1' ? 'You' : usersData.find(u => u.id === fromUserId).name,
        toUser: toUserId === 'user-1' ? 'You' : usersData.find(u => u.id === toUserId).name
      };
      
      settlementsData.push(newSettlement);
      
      return newSettlement;
    } catch (error) {
      console.error('Error creating settlement:', error);
      throw error;
    }
  },
  
  completeSettlement: async (settlementId) => {
    try {
      const settlementIndex = settlementsData.findIndex(s => s.id === settlementId);
      
      if (settlementIndex === -1) {
        throw new Error('Settlement not found');
      }
      
      settlementsData[settlementIndex].completed = true;
      
      return settlementsData[settlementIndex];
    } catch (error) {
      console.error('Error completing settlement:', error);
      throw error;
    }
  }
};

export default users;
