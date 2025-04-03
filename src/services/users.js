import { mockUsers, mockSettlements, generateId } from './mockData';
import { auth } from './auth';

// LocalStorage key for users
const USERS_STORAGE_KEY = 'budget_app_users';
const SETTLEMENTS_STORAGE_KEY = 'budget_app_settlements';

// Initialize with localStorage data or fallback to mockUsers
let usersData = [];

// Load users from localStorage or initialize with mockUsers
try {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (storedUsers) {
    usersData = JSON.parse(storedUsers);
  } else {
    usersData = [...mockUsers];
    // Save mock users to localStorage initially
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersData));
  }
} catch (error) {
  console.error('Error loading users from localStorage:', error);
  usersData = [...mockUsers];
}

// Initialize settlements
let settlementsData = [];
try {
  const storedSettlements = localStorage.getItem(SETTLEMENTS_STORAGE_KEY);
  if (storedSettlements) {
    settlementsData = JSON.parse(storedSettlements);
  } else {
    settlementsData = [...mockSettlements];
    localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(settlementsData));
  }
} catch (error) {
  console.error('Error loading settlements from localStorage:', error);
  settlementsData = [...mockSettlements];
}

// Helper function to save users to localStorage
const saveUsersToStorage = () => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersData));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

// Helper function to save settlements to localStorage
const saveSettlementsToStorage = () => {
  try {
    localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(settlementsData));
  } catch (error) {
    console.error('Error saving settlements to localStorage:', error);
  }
};

const users = {
  getAll: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
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
      saveUsersToStorage(); // Save to localStorage
      
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
      
      if (id !== currentUser.id) throw new Error('Not authorized to update this profile');
      
      const userIndex = usersData.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const updatedUser = {
        ...usersData[userIndex],
        name: userData.name,
        color: userData.color,
        updatedAt: new Date()
      };
      
      usersData[userIndex] = updatedUser;
      saveUsersToStorage(); // Save to localStorage
      
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
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Don't allow deleting current user (must go through auth)
      if (id === currentUser.id) {
        throw new Error('Cannot delete current user through this method');
      }
      
      // Only delete non-current users
      const userIndex = usersData.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Remove the user
      usersData.splice(userIndex, 1);
      saveUsersToStorage(); // Save to localStorage
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
  
  addCustomMember: async (memberData) => {
    try {
      // Check if a member with the same name already exists
      if (usersData.some(u => u.name.toLowerCase() === memberData.name.toLowerCase())) {
        throw new Error('A member with this name already exists');
      }
      
      const newMember = {
        id: generateId('user'),
        name: memberData.name,
        email: `${memberData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        color: memberData.color || 'blue',
        avatar: memberData.name.charAt(0).toUpperCase(),
        isCustomMember: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      usersData.push(newMember);
      saveUsersToStorage(); // Save to localStorage
      
      return newMember;
    } catch (error) {
      console.error('Error adding custom member:', error);
      throw error;
    }
  },
  
  getUserBalance: async (userId) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const targetUserId = userId || currentUser.id;
      
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
      saveSettlementsToStorage(); // Save to localStorage
      
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
      saveSettlementsToStorage(); // Save to localStorage
      
      return settlementsData[settlementIndex];
    } catch (error) {
      console.error('Error completing settlement:', error);
      throw error;
    }
  }
};

export default users;
