import { auth } from './auth';

// Mock expenses data that would normally be in a database
let expensesData = [
  {
    id: '1',
    description: 'Grocery shopping',
    amount: 45.80,
    paidBy: 'You',
    date: new Date(),
    splitWith: ['Alex', 'Sam', 'Jordan'],
    splitMethod: 'equally',
    category: 'Food'
  },
  {
    id: '2',
    description: 'Uber ride',
    amount: 24.50,
    paidBy: 'Alex',
    date: new Date(Date.now() - 86400000), // Yesterday
    splitWith: ['You'],
    splitMethod: 'equally',
    category: 'Transport'
  },
  {
    id: '3',
    description: 'Movie tickets',
    amount: 62.00,
    paidBy: 'You',
    date: new Date('2023-03-28'),
    splitWith: ['Alex', 'Sam', 'Jordan'],
    splitMethod: 'equally',
    category: 'Entertainment'
  },
  {
    id: '4',
    description: 'Electricity bill',
    amount: 95.20,
    paidBy: 'You',
    date: new Date('2023-03-26'),
    splitWith: ['Jordan', 'Sam'],
    splitMethod: 'equally',
    category: 'Utilities'
  }
];

const expenses = {
  getAll: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...expensesData]);
      }, 300);
    });
  },
  
  getById: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const expense = expensesData.find(exp => exp.id === id);
        if (expense) {
          resolve({...expense});
        } else {
          reject(new Error('Expense not found'));
        }
      }, 200);
    });
  },
  
  create: async (expenseData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newExpense = {
          ...expenseData,
          id: Date.now().toString(),
          createdAt: new Date()
        };
        expensesData = [newExpense, ...expensesData];
        resolve(newExpense);
      }, 300);
    });
  },
  
  update: async (id, expenseData) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = expensesData.findIndex(exp => exp.id === id);
        if (index !== -1) {
          const updatedExpense = {
            ...expensesData[index],
            ...expenseData,
            updatedAt: new Date()
          };
          expensesData[index] = updatedExpense;
          resolve(updatedExpense);
        } else {
          reject(new Error('Expense not found'));
        }
      }, 300);
    });
  },
  
  delete: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = expensesData.length;
        expensesData = expensesData.filter(exp => exp.id !== id);
        
        if (expensesData.length < initialLength) {
          resolve({ success: true });
        } else {
          reject(new Error('Expense not found'));
        }
      }, 200);
    });
  },
  
  getByGroup: async (groupId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, expenses would be linked to groups
        // This is a simplified implementation
        const groupExpenses = expensesData.filter(exp => 
          exp.groupId === groupId
        );
        resolve(groupExpenses);
      }, 300);
    });
  },
  
  getStats: async () => {
    // Simulate API call for analytics data
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
        
        const byCategory = expensesData.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {});
        
        const byMonth = expensesData.reduce((acc, exp) => {
          const month = exp.date.getMonth();
          acc[month] = (acc[month] || 0) + exp.amount;
          return acc;
        }, {});
        
        resolve({ total, byCategory, byMonth });
      }, 400);
    });
  }
};

export default expenses;
