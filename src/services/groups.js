// Helper function to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// LocalStorage keys
const STORAGE_KEY = 'budget_app_groups';
const SETTLEMENTS_STORAGE_KEY = 'budget_app_group_settlements';

// Helper function to get groups from localStorage without using mock data
const getGroupsFromStorage = () => {
  try {
    const storedGroups = localStorage.getItem(STORAGE_KEY);
    if (storedGroups) {
      return JSON.parse(storedGroups);
    }
    
    // Return empty array instead of mock data
    return [];
  } catch (error) {
    console.error('Error loading groups from localStorage:', error);
    return [];
  }
};

// Helper function to get settlements from localStorage
const getSettlementsFromStorage = () => {
  try {
    const storedSettlements = localStorage.getItem(SETTLEMENTS_STORAGE_KEY);
    if (storedSettlements) {
      return JSON.parse(storedSettlements);
    }
    
    // Return empty array if no settlements
    return [];
  } catch (error) {
    console.error('Error loading settlements from localStorage:', error);
    return [];
  }
};

// Helper function to initialize local storage once
const initializeStorage = () => {
  // Check if groups have been initialized
  if (!localStorage.getItem('groups_initialized')) {
    // Create empty groups array
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    // Mark as initialized
    localStorage.setItem('groups_initialized', 'true');
  }
  
  // Check if settlements have been initialized
  if (!localStorage.getItem('group_settlements_initialized')) {
    // Create empty settlements array
    localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify([]));
    // Mark as initialized
    localStorage.setItem('group_settlements_initialized', 'true');
  }
};

// Call initialization once when module is loaded
initializeStorage();

// Helper function to save groups to localStorage
const saveGroupsToStorage = (groups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving groups to localStorage:', error);
  }
};

// Helper function to save settlements to localStorage
const saveSettlementsToStorage = (settlements) => {
  try {
    localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(settlements));
  } catch (error) {
    console.error('Error saving settlements to localStorage:', error);
  }
};

// Helper function to dispatch events for real-time updates
const dispatchGroupEvent = (eventName, payload) => {
  const event = new CustomEvent(eventName, { detail: payload });
  window.dispatchEvent(event);
};

// Service methods
const getAll = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return getGroupsFromStorage();
};

const getById = async (id) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const groups = getGroupsFromStorage();
  return groups.find(group => group.id === id) || null;
};

const create = async (groupData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Create new group with unique ID
  const newGroup = {
    id: generateId(),
    name: groupData.name,
    icon: groupData.icon || '👥',
    members: ['You', ...(groupData.members || [])], // Always include the current user
    expenses: [],
    settlements: [],
    createdAt: new Date().toISOString()
  };
  
  // Add to the groups list
  const groups = getGroupsFromStorage();
  const updatedGroups = [...groups, newGroup];
  saveGroupsToStorage(updatedGroups);
  
  // Dispatch event for real-time update
  dispatchGroupEvent('groupAdded', newGroup);
  
  return newGroup;
};

const update = async (id, groupData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Update the group
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === id);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${id} not found`);
  }
  
  const updatedGroup = {
    ...groups[groupIndex],
    ...groupData,
    updatedAt: new Date().toISOString()
  };
  
  // Replace the group in the list
  const updatedGroups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1)
  ];
  
  saveGroupsToStorage(updatedGroups);
  
  // Dispatch event for real-time update
  dispatchGroupEvent('groupUpdated', updatedGroup);
  
  return updatedGroup;
};

const remove = async (id) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Remove the group
  const groups = getGroupsFromStorage();
  const updatedGroups = groups.filter(group => group.id !== id);
  
  saveGroupsToStorage(updatedGroups);
  
  // Dispatch event for real-time update
  dispatchGroupEvent('groupDeleted', { id });
  
  return true;
};

const addMember = async (groupId, memberName) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find the group
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === groupId);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const group = groups[groupIndex];
  
  // Check if member already exists
  if (group.members.includes(memberName)) {
    throw new Error(`Member ${memberName} already in group`);
  }
  
  // Add the member to the group
  const updatedGroup = {
    ...group,
    members: [...group.members, memberName],
    updatedAt: new Date().toISOString()
  };
  
  // Update group in storage
  const updatedGroups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1)
  ];
  
  saveGroupsToStorage(updatedGroups);
  
  // Dispatch event for real-time update
  dispatchGroupEvent('groupMemberAdded', { 
    group: updatedGroup,
    memberName
  });
  
  return updatedGroup;
};

const removeMember = async (groupId, memberName) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find the group
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === groupId);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const group = groups[groupIndex];
  
  // Check if member exists
  if (!group.members.includes(memberName)) {
    throw new Error(`Member ${memberName} not in group`);
  }
  
  // Don't allow removing "You" (the current user)
  if (memberName === 'You') {
    throw new Error(`Cannot remove yourself from group`);
  }
  
  // Remove the member from the group
  const updatedGroup = {
    ...group,
    members: group.members.filter(name => name !== memberName),
    updatedAt: new Date().toISOString()
  };
  
  // Update group in storage
  const updatedGroups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1)
  ];
  
  saveGroupsToStorage(updatedGroups);
  
  // Dispatch event for real-time update
  dispatchGroupEvent('groupMemberRemoved', { 
    group: updatedGroup, 
    memberName 
  });
  
  return updatedGroup;
};

// Add an expense to a group
const addExpense = async (groupId, expenseId) => {
  // Find the group
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === groupId);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const group = groups[groupIndex];
  
  // Add the expense if it doesn't already exist
  if (!group.expenses.includes(expenseId)) {
    const updatedGroup = {
      ...group,
      expenses: [...group.expenses, expenseId],
      updatedAt: new Date().toISOString()
    };
    
    // Update group in storage
    const updatedGroups = [
      ...groups.slice(0, groupIndex),
      updatedGroup,
      ...groups.slice(groupIndex + 1)
    ];
    
    saveGroupsToStorage(updatedGroups);
    
    // Dispatch event for real-time update
    dispatchGroupEvent('groupUpdated', updatedGroup);
    
    return updatedGroup;
  }
  
  return group;
};

// Remove an expense from a group
const removeExpense = async (groupId, expenseId) => {
  // Find the group
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === groupId);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const group = groups[groupIndex];
  
  // Remove the expense if it exists
  if (group.expenses.includes(expenseId)) {
    const updatedGroup = {
      ...group,
      expenses: group.expenses.filter(id => id !== expenseId),
      updatedAt: new Date().toISOString()
    };
    
    // Update group in storage
    const updatedGroups = [
      ...groups.slice(0, groupIndex),
      updatedGroup,
      ...groups.slice(groupIndex + 1)
    ];
    
    saveGroupsToStorage(updatedGroups);
    
    // Dispatch event for real-time update
    dispatchGroupEvent('groupUpdated', updatedGroup);
    
    return updatedGroup;
  }
  
  return group;
};

// Get all settlements for a specific group
const getSettlements = async (groupId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const settlements = getSettlementsFromStorage();
  return settlements.filter(settlement => settlement.groupId === groupId);
};

// Create a new settlement for a group
const createSettlement = async (groupId, fromUserId, toUserId, amount) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const groups = getGroupsFromStorage();
  const group = groups.find(group => group.id === groupId);
  
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  // Find user names
  const fromUser = fromUserId === 'user-1' ? 'You' : group.members.find(member => member !== 'You');
  const toUser = toUserId === 'user-1' ? 'You' : group.members.find(member => member !== 'You');
  
  // Create new settlement
  const newSettlement = {
    id: generateId(),
    groupId,
    fromUserId,
    toUserId,
    fromUser,
    toUser,
    amount,
    date: new Date().toISOString(),
    completed: false
  };
  
  // Add to settlements storage
  const settlements = getSettlementsFromStorage();
  const updatedSettlements = [...settlements, newSettlement];
  saveSettlementsToStorage(updatedSettlements);
  
  // Dispatch event for real-time update
  dispatchGroupEvent('settlementCreated', newSettlement);
  
  return newSettlement;
};

// Mark a settlement as completed
const completeSettlement = async (settlementId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const settlements = getSettlementsFromStorage();
  const settlementIndex = settlements.findIndex(s => s.id === settlementId);
  
  if (settlementIndex === -1) {
    throw new Error(`Settlement with ID ${settlementId} not found`);
  }
  
  // Update settlement status
  const updatedSettlement = {
    ...settlements[settlementIndex],
    completed: true,
    completedDate: new Date().toISOString()
  };
  
  // Update settlement in storage
  const updatedSettlements = [
    ...settlements.slice(0, settlementIndex),
    updatedSettlement,
    ...settlements.slice(settlementIndex + 1)
  ];
  
  saveSettlementsToStorage(updatedSettlements);
  
  // Dispatch event for real-time update
  dispatchGroupEvent('settlementCompleted', updatedSettlement);
  
  return updatedSettlement;
};

// Calculate balances between group members
const calculateBalances = async (groupId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const groups = getGroupsFromStorage();
  const group = groups.find(g => g.id === groupId);
  
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  // For now, generate random balances for each member
  // In a real app, this would be calculated from expenses
  const balances = group.members.map(member => {
    const isCurrentUser = member === 'You';
    return {
      name: member,
      // If current user, balance is 0, otherwise random between -100 and 100
      balance: isCurrentUser ? 0 : (Math.floor(Math.random() * 200) - 100)
    };
  });
  
  return balances;
};

const groups = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  addMember,
  removeMember,
  addExpense,
  removeExpense,
  getSettlements,
  createSettlement,
  completeSettlement,
  calculateBalances
};

export default groups;
