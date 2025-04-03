const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const STORAGE_KEY = 'budget_app_groups';
const SETTLEMENTS_STORAGE_KEY = 'budget_app_group_settlements';

const getGroupsFromStorage = () => {
  try {
    const storedGroups = localStorage.getItem(STORAGE_KEY);
    if (storedGroups) {
      return JSON.parse(storedGroups);
    }
    
    return [];
  } catch (error) {
    console.error('Error loading groups from localStorage:', error);
    return [];
  }
};

const getSettlementsFromStorage = () => {
  try {
    const storedSettlements = localStorage.getItem(SETTLEMENTS_STORAGE_KEY);
    if (storedSettlements) {
      return JSON.parse(storedSettlements);
    }
    
    return [];
  } catch (error) {
    console.error('Error loading settlements from localStorage:', error);
    return [];
  }
};

const initializeStorage = () => {
  if (!localStorage.getItem('groups_initialized')) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem('groups_initialized', 'true');
  }
  
  if (!localStorage.getItem('group_settlements_initialized')) {
    localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem('group_settlements_initialized', 'true');
  }
};

initializeStorage();

const saveGroupsToStorage = (groups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving groups to localStorage:', error);
  }
};

const saveSettlementsToStorage = (settlements) => {
  try {
    localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(settlements));
  } catch (error) {
    console.error('Error saving settlements to localStorage:', error);
  }
};

const dispatchGroupEvent = (eventName, payload) => {
  const event = new CustomEvent(eventName, { detail: payload });
  window.dispatchEvent(event);
};

const getAll = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return getGroupsFromStorage();
};

const getById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const groups = getGroupsFromStorage();
  return groups.find(group => group.id === id) || null;
};

const create = async (groupData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newGroup = {
    id: generateId(),
    name: groupData.name,
    icon: groupData.icon || '👥',
    members: ['You', ...(groupData.members || [])],
    expenses: [],
    settlements: [],
    createdAt: new Date().toISOString()
  };
  
  const groups = getGroupsFromStorage();
  const updatedGroups = [...groups, newGroup];
  saveGroupsToStorage(updatedGroups);
  
  dispatchGroupEvent('groupAdded', newGroup);
  
  return newGroup;
};

const update = async (id, groupData) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
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
  
  const updatedGroups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1)
  ];
  
  saveGroupsToStorage(updatedGroups);
  
  dispatchGroupEvent('groupUpdated', updatedGroup);
  
  return updatedGroup;
};

const remove = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const groups = getGroupsFromStorage();
  const updatedGroups = groups.filter(group => group.id !== id);
  
  saveGroupsToStorage(updatedGroups);
  
  dispatchGroupEvent('groupDeleted', { id });
  
  return true;
};

const addMember = async (groupId, memberName) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === groupId);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const group = groups[groupIndex];
  
  if (group.members.includes(memberName)) {
    throw new Error(`Member ${memberName} already in group`);
  }
  
  const updatedGroup = {
    ...group,
    members: [...group.members, memberName],
    updatedAt: new Date().toISOString()
  };
  
  const updatedGroups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1)
  ];
  
  saveGroupsToStorage(updatedGroups);
  
  dispatchGroupEvent('groupMemberAdded', { 
    group: updatedGroup,
    memberName
  });
  
  return updatedGroup;
};

const removeMember = async (groupId, memberName) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === groupId);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const group = groups[groupIndex];
  
  if (!group.members.includes(memberName)) {
    throw new Error(`Member ${memberName} not in group`);
  }
  
  if (memberName === 'You') {
    throw new Error(`Cannot remove yourself from group`);
  }
  
  const updatedGroup = {
    ...group,
    members: group.members.filter(name => name !== memberName),
    updatedAt: new Date().toISOString()
  };
  
  const updatedGroups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1)
  ];
  
  saveGroupsToStorage(updatedGroups);
  
  dispatchGroupEvent('groupMemberRemoved', { 
    group: updatedGroup, 
    memberName 
  });
  
  return updatedGroup;
};

const addExpense = async (groupId, expenseId) => {
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === groupId);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const group = groups[groupIndex];
  
  if (!group.expenses.includes(expenseId)) {
    const updatedGroup = {
      ...group,
      expenses: [...group.expenses, expenseId],
      updatedAt: new Date().toISOString()
    };
    
    const updatedGroups = [
      ...groups.slice(0, groupIndex),
      updatedGroup,
      ...groups.slice(groupIndex + 1)
    ];
    
    saveGroupsToStorage(updatedGroups);
    
    dispatchGroupEvent('groupUpdated', updatedGroup);
    
    return updatedGroup;
  }
  
  return group;
};

const removeExpense = async (groupId, expenseId) => {
  const groups = getGroupsFromStorage();
  const groupIndex = groups.findIndex(group => group.id === groupId);
  
  if (groupIndex === -1) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const group = groups[groupIndex];
  
  if (group.expenses.includes(expenseId)) {
    const updatedGroup = {
      ...group,
      expenses: group.expenses.filter(id => id !== expenseId),
      updatedAt: new Date().toISOString()
    };
    
    const updatedGroups = [
      ...groups.slice(0, groupIndex),
      updatedGroup,
      ...groups.slice(groupIndex + 1)
    ];
    
    saveGroupsToStorage(updatedGroups);
    
    dispatchGroupEvent('groupUpdated', updatedGroup);
    
    return updatedGroup;
  }
  
  return group;
};

const getSettlements = async (groupId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const settlements = getSettlementsFromStorage();
  return settlements.filter(settlement => settlement.groupId === groupId);
};

const createSettlement = async (groupId, fromUserId, toUserId, amount) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const groups = getGroupsFromStorage();
  const group = groups.find(group => group.id === groupId);
  
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const fromUser = fromUserId === 'user-1' ? 'You' : group.members.find(member => member !== 'You');
  const toUser = toUserId === 'user-1' ? 'You' : group.members.find(member => member !== 'You');
  
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
  
  const settlements = getSettlementsFromStorage();
  const updatedSettlements = [...settlements, newSettlement];
  saveSettlementsToStorage(updatedSettlements);
  
  dispatchGroupEvent('settlementCreated', newSettlement);
  
  return newSettlement;
};

const completeSettlement = async (settlementId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const settlements = getSettlementsFromStorage();
  const settlementIndex = settlements.findIndex(s => s.id === settlementId);
  
  if (settlementIndex === -1) {
    throw new Error(`Settlement with ID ${settlementId} not found`);
  }
  
  const updatedSettlement = {
    ...settlements[settlementIndex],
    completed: true,
    completedDate: new Date().toISOString()
  };
  
  const updatedSettlements = [
    ...settlements.slice(0, settlementIndex),
    updatedSettlement,
    ...settlements.slice(settlementIndex + 1)
  ];
  
  saveSettlementsToStorage(updatedSettlements);
  
  dispatchGroupEvent('settlementCompleted', updatedSettlement);
  
  return updatedSettlement;
};

const calculateBalances = async (groupId) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const groups = getGroupsFromStorage();
  const group = groups.find(g => g.id === groupId);
  
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  const balances = group.members.map(member => {
    const isCurrentUser = member === 'You';
    return {
      name: member,
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
