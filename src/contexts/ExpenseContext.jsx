import React, { createContext, useState, useEffect } from 'react';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock initial expenses
  const mockExpenses = [
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

  useEffect(() => {
    // In a real app, this would fetch from an API
    setExpenses(mockExpenses);
    setLoading(false);
  }, []);

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses([newExpense, ...expenses]);
  };

  const updateExpense = (id, updatedExpense) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, ...updatedExpense } : expense
    ));
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      loading,
      addExpense,
      updateExpense,
      deleteExpense
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
