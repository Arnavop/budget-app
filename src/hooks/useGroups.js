import { useContext } from 'react';
import { GroupContext } from '../contexts/GroupContext';

export const useGroups = () => {
  return useContext(GroupContext);
};
