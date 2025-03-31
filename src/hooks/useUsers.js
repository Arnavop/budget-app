import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export const useUsers = () => {
  return useContext(UserContext);
};
