import { v4 as uuidv4 } from 'uuid';

// LocalStorage key
const STORAGE_KEY = 'budget_app_groups';

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

// Helper function to initialize local storage once
const initializeStorage = () => {
  // Check if groups have been initialized
  if (!localStorage.getItem('groups_initialized')) {
    // Create empty groups array
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    // Mark as initialized
    localStorage.setItem('groups_initialized', 'true');
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
    id: uuidv4(),
    name: groupData.name,
    icon: groupData.icon || '👥',
    members: ['You', ...(groupData.members || [])], // Always include the current user
    expenses: [],
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

const groups = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  addMember,
  removeMember,
  addExpense,
  removeExpense
};

export default groups;
