export const mockUsers = [
  {
    id: 'user-1',
    name: 'You',
    originalName: 'Current User',
    email: 'user@example.com',
    color: 'blue',
    avatar: 'Y',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-03-20T14:30:00Z'
  }
  // Removed hardcoded users (Alex, Sam, Jordan)
  // Users can now be added through the ManageMembers component
];

export const mockExpenses = [
  {
    id: 'expense-1',
    description: 'Dinner at Italian Restaurant',
    amount: 120.50,
    paidBy: 'You',
    paidById: 'user-1',
    date: '2023-04-10T19:30:00Z',
    splitWith: [], // Empty until custom members are added
    splitMethod: 'equal',
    category: 'Food',
    notes: 'Great dinner with friends',
    isSettled: false,
    groupId: null,
    updatedAt: '2023-04-10T19:30:00Z'
  },
  {
    id: 'expense-3',
    description: 'Groceries',
    amount: 87.35,
    paidBy: 'You',
    paidById: 'user-1',
    date: '2023-04-05T11:20:00Z',
    splitWith: [], // Empty until custom members are added
    splitMethod: 'equal',
    category: 'Food',
    notes: 'Weekly groceries',
    isSettled: false,
    groupId: null,
    updatedAt: '2023-04-05T11:20:00Z'
  }
  // Removed expenses involving the removed mock users
];

export const mockGroups = [
  {
    id: 'group-1',
    name: 'Roommates',
    icon: '🏠',
    createdBy: 'user-1',
    updatedAt: '2023-03-15T10:00:00Z',
    members: ['You'], // Only you until custom members are added
    expenses: []
  },
  {
    id: 'group-3',
    name: 'Game Night',
    icon: '🎮',
    createdBy: 'user-1',
    updatedAt: '2023-04-01T20:00:00Z',
    members: ['You'], // Only you until custom members are added
    expenses: []
  }
];

export const mockSettlements = [
  // Removed settlements involving removed mock users
];

export const mockActivities = [
  {
    id: 'activity-1',
    userId: 'user-1',
    action: 'created',
    resourceType: 'expense',
    resourceId: 'expense-1',
    metadata: {
      description: 'Dinner at Italian Restaurant',
      amount: 120.50
    },
    createdAt: '2023-04-10T19:30:00Z',
    user: {
      name: 'You'
    }
  },
  {
    id: 'activity-3',
    userId: 'user-1',
    action: 'created',
    resourceType: 'group',
    resourceId: 'group-3',
    metadata: {
      name: 'Game Night'
    },
    createdAt: '2023-04-01T20:00:00Z',
    user: {
      name: 'You'
    }
  },
  {
    id: 'activity-5',
    userId: 'user-1',
    action: 'updated',
    resourceType: 'expense',
    resourceId: 'expense-3',
    metadata: {
      description: 'Groceries',
      amount: 87.35
    },
    createdAt: '2023-04-06T10:15:00Z',
    user: {
      name: 'You'
    }
  }
  // Removed activities involving removed mock users
];

export const generateId = (prefix) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};