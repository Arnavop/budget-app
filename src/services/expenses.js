import { generateId } from './mockData';
import { auth } from './auth';

const STORAGE_KEY = 'budget_app_expenses';

let expensesData = [];
try {
  const storedExpenses = localStorage.getItem(STORAGE_KEY);
  if (storedExpenses) {
    expensesData = JSON.parse(storedExpenses);
  }
} catch (error) {
  console.error('Error loading expenses from localStorage:', error);
}

const saveExpensesToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expensesData));
    window.dispatchEvent(new CustomEvent('expensesUpdated'));
  } catch (error) {
    console.error('Error saving expenses to localStorage:', error);
  }
};

const expenses = {
  getAll: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const userId = currentUser.id;
      
      return expensesData.filter(expense => 
        expense.paidById === userId || expense.splitWith.includes('You')
      );
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const expense = expensesData.find(exp => exp.id === id);
      
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      return expense;
    } catch (error) {
      console.error('Error fetching expense details:', error);
      throw error;
    }
  },
  
  create: async (expenseData) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const newExpense = {
        id: generateId('expense'),
        description: expenseData.description,
        amount: expenseData.amount,
        paidBy: expenseData.paidBy || 'You',
        paidById: expenseData.paidByUserId || currentUser.id,
        date: new Date(expenseData.date || new Date()),
        splitWith: expenseData.splitWith || [],
        splitMethod: expenseData.splitMethod || 'equal',
        category: expenseData.category || 'Other',
        notes: expenseData.notes || '',
        isSettled: false,
        groupId: expenseData.groupId || null,
        updatedAt: new Date()
      };
      
      expensesData.unshift(newExpense);
      
      saveExpensesToStorage();
      
      return newExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  },
  
  update: async (id, expenseData) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const expenseIndex = expensesData.findIndex(exp => exp.id === id);
      
      if (expenseIndex === -1) {
        throw new Error('Expense not found');
      }
      
      const updatedExpense = {
        ...expensesData[expenseIndex],
        description: expenseData.description,
        amount: expenseData.amount,
        splitMethod: expenseData.splitMethod,
        category: expenseData.category,
        date: new Date(expenseData.date),
        notes: expenseData.notes || '',
        updatedAt: new Date()
      };
      
      if (expenseData.paidBy) {
        updatedExpense.paidBy = expenseData.paidBy;
      }
      
      if (expenseData.paidByUserId) {
        updatedExpense.paidById = expenseData.paidByUserId;
      }
      
      if (expenseData.splitWith) {
        updatedExpense.splitWith = expenseData.splitWith;
      }
      
      expensesData[expenseIndex] = updatedExpense;
      
      saveExpensesToStorage();
      
      return updatedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const expenseIndex = expensesData.findIndex(exp => exp.id === id);
      
      if (expenseIndex === -1) {
        throw new Error('Expense not found');
      }
      
      expensesData.splice(expenseIndex, 1);
      
      saveExpensesToStorage();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },
  
  getByGroup: async (groupId) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      return expensesData.filter(expense => expense.groupId === groupId);
    } catch (error) {
      console.error('Error fetching group expenses:', error);
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const userId = currentUser.id;
      
      const userExpenses = expensesData.filter(expense => 
        expense.paidById === userId || expense.splitWith.includes('You')
      );
      
      const total = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      const byCategory = userExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});
      
      const byMonth = userExpenses.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const month = date.getMonth();
        acc[month] = (acc[month] || 0) + exp.amount;
        return acc;
      }, {});
      
      return { total, byCategory, byMonth };
    } catch (error) {
      console.error('Error fetching expense statistics:', error);
      throw error;
    }
  },
  
  settleExpense: async (expenseId, settled = true) => {
    try {
      const expenseIndex = expensesData.findIndex(exp => exp.id === expenseId);
      
      if (expenseIndex === -1) {
        throw new Error('Expense not found');
      }
      
      expensesData[expenseIndex].isSettled = settled;
      
      saveExpensesToStorage();
      
      return expensesData[expenseIndex];
    } catch (error) {
      console.error('Error settling expense:', error);
      throw error;
    }
  }
};

export default expenses;