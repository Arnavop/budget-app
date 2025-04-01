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
  },
  {
    id: 'user-2',
    name: 'Alex',
    originalName: 'Alex Johnson',
    email: 'alex@example.com',
    color: 'green',
    avatar: 'A',
    createdAt: '2023-01-16T11:20:00Z',
    updatedAt: '2023-02-22T09:15:00Z'
  },
  {
    id: 'user-3',
    name: 'Sam',
    originalName: 'Sam Wilson',
    email: 'sam@example.com',
    color: 'red',
    avatar: 'S',
    createdAt: '2023-01-18T15:40:00Z',
    updatedAt: '2023-03-05T16:25:00Z'
  },
  {
    id: 'user-4',
    name: 'Jordan',
    originalName: 'Jordan Lee',
    email: 'jordan@example.com',
    color: 'purple',
    avatar: 'J',
    createdAt: '2023-02-01T09:10:00Z',
    updatedAt: '2023-03-15T11:05:00Z'
  }
];

export const mockExpenses = [
  {
    id: 'expense-1',
    description: 'Dinner at Italian Restaurant',
    amount: 120.50,
    paidBy: 'You',
    paidById: 'user-1',
    date: '2023-04-10T19:30:00Z',
    splitWith: ['Alex', 'Sam', 'Jordan'],
    splitMethod: 'equal',
    category: 'Food',
    notes: 'Great dinner with friends',
    isSettled: false,
    groupId: 'group-1',
    updatedAt: '2023-04-10T19:30:00Z'
  },
  {
    id: 'expense-2',
    description: 'Movie tickets',
    amount: 48.00,
    paidBy: 'Alex',
    paidById: 'user-2',
    date: '2023-04-08T18:00:00Z',
    splitWith: ['You', 'Sam'],
    splitMethod: 'equal',
    category: 'Entertainment',
    notes: '',
    isSettled: true,
    groupId: 'group-1',
    updatedAt: '2023-04-09T10:15:00Z'
  },
  {
    id: 'expense-3',
    description: 'Groceries',
    amount: 87.35,
    paidBy: 'You',
    paidById: 'user-1',
    date: '2023-04-05T11:20:00Z',
    splitWith: ['Sam'],
    splitMethod: 'equal',
    category: 'Food',
    notes: 'Weekly groceries',
    isSettled: false,
    groupId: null,
    updatedAt: '2023-04-05T11:20:00Z'
  },
  {
    id: 'expense-4',
    description: 'Utility Bill',
    amount: 135.20,
    paidBy: 'Jordan',
    paidById: 'user-4',
    date: '2023-04-01T09:00:00Z',
    splitWith: ['You', 'Sam'],
    splitMethod: 'equal',
    category: 'Utilities',
    notes: 'Monthly utilities',
    isSettled: false,
    groupId: 'group-2',
    updatedAt: '2023-04-01T09:00:00Z'
  },
  {
    id: 'expense-5',
    description: 'Lunch',
    amount: 42.75,
    paidBy: 'Sam',
    paidById: 'user-3',
    date: '2023-03-28T13:15:00Z',
    splitWith: ['You', 'Alex', 'Jordan'],
    splitMethod: 'equal',
    category: 'Food',
    notes: '',
    isSettled: true,
    groupId: null,
    updatedAt: '2023-03-28T15:30:00Z'
  }
];

export const mockGroups = [
  {
    id: 'group-1',
    name: 'Roommates',
    icon: '🏠',
    createdBy: 'user-1',
    updatedAt: '2023-03-15T10:00:00Z',
    members: ['You', 'Alex', 'Sam'],
    expenses: ['expense-1', 'expense-2']
  },
  {
    id: 'group-2',
    name: 'Trip to Vegas',
    icon: '✈️',
    createdBy: 'user-2',
    updatedAt: '2023-03-20T14:30:00Z',
    members: ['You', 'Jordan', 'Sam'],
    expenses: ['expense-4']
  },
  {
    id: 'group-3',
    name: 'Game Night',
    icon: '🎮',
    createdBy: 'user-1',
    updatedAt: '2023-04-01T20:00:00Z',
    members: ['You', 'Alex', 'Jordan', 'Sam'],
    expenses: []
  }
];

export const mockSettlements = [
  {
    id: 'settlement-1',
    fromUser: 'You',
    toUser: 'Alex',
    fromUserId: 'user-1',
    toUserId: 'user-2',
    amount: 25.50,
    date: '2023-04-05T14:00:00Z',
    completed: false
  },
  {
    id: 'settlement-2',
    fromUser: 'Sam',
    toUser: 'You',
    fromUserId: 'user-3',
    toUserId: 'user-1',
    amount: 43.20,
    date: '2023-04-02T09:30:00Z',
    completed: false
  },
  {
    id: 'settlement-3',
    fromUser: 'Jordan',
    toUser: 'You',
    fromUserId: 'user-4',
    toUserId: 'user-1',
    amount: 18.75,
    date: '2023-03-28T16:45:00Z',
    completed: true
  }
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
    id: 'activity-2',
    userId: 'user-2',
    action: 'created',
    resourceType: 'expense',
    resourceId: 'expense-2',
    metadata: {
      description: 'Movie tickets',
      amount: 48.00
    },
    createdAt: '2023-04-08T18:00:00Z',
    user: {
      name: 'Alex'
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
    id: 'activity-4',
    userId: 'user-3',
    action: 'created',
    resourceType: 'settlement',
    resourceId: 'settlement-2',
    metadata: {
      amount: 43.20,
      fromUserId: 'user-3',
      toUserId: 'user-1'
    },
    createdAt: '2023-04-02T09:30:00Z',
    user: {
      name: 'Sam'
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
];

export const generateId = (prefix) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};