import { useContext } from 'react';
import { ExpenseContext } from '../contexts/ExpenseContext';

export const useExpenses = () => {
  return useContext(ExpenseContext);
};
