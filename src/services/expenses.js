// expenses.js - using mock data
import { generateId } from './mockData';
import { auth } from './auth';

// In-memory storage to simulate a database - start with empty array instead of mock data
let expensesData = [];

const expenses = {
  getAll: async () => {
    try {
      // Get current user from auth
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const userId = currentUser.id;
      
      // Return expenses where current user is involved
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
        paidBy: expenseData.paidBy || 'You', // Use the provided paidBy or default to current user
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
      
      // Add to our in-memory database
      expensesData.unshift(newExpense);
      
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
      
      // Update the expense
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
      
      // If paidBy has changed, update it
      if (expenseData.paidBy) {
        updatedExpense.paidBy = expenseData.paidBy;
      }
      
      // If paidByUserId has changed, update it
      if (expenseData.paidByUserId) {
        updatedExpense.paidById = expenseData.paidByUserId;
      }
      
      // If splitWith has changed, update it
      if (expenseData.splitWith) {
        updatedExpense.splitWith = expenseData.splitWith;
      }
      
      // Update in our in-memory database
      expensesData[expenseIndex] = updatedExpense;
      
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
      
      // Remove from our in-memory database
      expensesData.splice(expenseIndex, 1);
      
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
      
      // Return all expenses for this group
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
      
      // Get all expenses where the current user is involved
      const userExpenses = expensesData.filter(expense => 
        expense.paidById === userId || expense.splitWith.includes('You')
      );
      
      // Calculate statistics
      const total = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      // Group by category
      const byCategory = userExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});
      
      // Group by month
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
      
      // Update the settled status
      expensesData[expenseIndex].isSettled = settled;
      
      return expensesData[expenseIndex];
    } catch (error) {
      console.error('Error settling expense:', error);
      throw error;
    }
  }
};

export default expenses;