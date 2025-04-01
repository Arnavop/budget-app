import React, { createContext, useState, useEffect } from 'react';
import groupService from '../services/groups';
import { useAuth } from '../hooks/useAuth';
import activities from '../services/activities';

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setGroups([]);
      setIsLoading(false);
      return;
    }
    
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await groupService.getAll();
        setGroups(data);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroups();
  }, [currentUser]);

  useEffect(() => {
    const handleGroupAdded = (event) => {
      const newGroup = event.detail;
      setGroups(prev => {
        if (!prev.some(group => group.id === newGroup.id)) {
          return [...prev, newGroup];
        }
        return prev;
      });
      
      createActivity('created', 'group', newGroup.id, { name: newGroup.name });
    };
    
    const handleGroupUpdated = (event) => {
      const updatedGroup = event.detail;
      setGroups(prev => 
        prev.map(group => group.id === updatedGroup.id ? updatedGroup : group)
      );
    };
    
    const handleGroupDeleted = (event) => {
      const { id } = event.detail;
      setGroups(prev => prev.filter(group => group.id !== id));
    };
    
    const handleMemberAdded = (event) => {
      const { group, memberName } = event.detail;
      setGroups(prev => 
        prev.map(g => g.id === group.id ? group : g)
      );
      
      createActivity('added_member', 'group', group.id, { 
        name: group.name, 
        memberName 
      });
    };
    
    const handleMemberRemoved = (event) => {
      const { group, memberName } = event.detail;
      setGroups(prev => 
        prev.map(g => g.id === group.id ? group : g)
      );
      
      createActivity('removed_member', 'group', group.id, { 
        name: group.name, 
        memberName 
      });
    };
    
    const createActivity = async (action, resourceType, resourceId, metadata) => {
      try {
        await activities.create({
          action,
          resourceType,
          resourceId,
          metadata
        });
      } catch (error) {
        console.error('Error creating activity:', error);
      }
    };
    
    window.addEventListener('groupAdded', handleGroupAdded);
    window.addEventListener('groupUpdated', handleGroupUpdated);
    window.addEventListener('groupDeleted', handleGroupDeleted);
    window.addEventListener('groupMemberAdded', handleMemberAdded);
    window.addEventListener('groupMemberRemoved', handleMemberRemoved);
    
    return () => {
      window.removeEventListener('groupAdded', handleGroupAdded);
      window.removeEventListener('groupUpdated', handleGroupUpdated);
      window.removeEventListener('groupDeleted', handleGroupDeleted);
      window.removeEventListener('groupMemberAdded', handleMemberAdded);
      window.removeEventListener('groupMemberRemoved', handleMemberRemoved);
    };
  }, [currentUser]);

  const addGroup = async (groupData) => {
    try {
      const newGroup = await groupService.create(groupData);
      return newGroup;
    } catch (err) {
      console.error("Error adding group:", err);
      throw err;
    }
  };

  const updateGroup = async (id, groupData) => {
    try {
      const updated = await groupService.update(id, groupData);
      return updated;
    } catch (err) {
      console.error("Error updating group:", err);
      throw err;
    }
  };

  const deleteGroup = async (id) => {
    try {
      await groupService.delete(id);
      return true;
    } catch (err) {
      console.error("Error deleting group:", err);
      throw err;
    }
  };

  const getGroupById = async (id) => {
    try {
      const existingGroup = groups.find(group => group.id === id);
      if (existingGroup) return existingGroup;
      
      return await groupService.getById(id);
    } catch (err) {
      console.error("Error fetching group details:", err);
      throw err;
    }
  };

  const addGroupMember = async (groupId, memberName) => {
    try {
      await groupService.addMember(groupId, memberName);
      return true;
    } catch (err) {
      console.error("Error adding group member:", err);
      throw err;
    }
  };

  const removeGroupMember = async (groupId, memberName) => {
    try {
      await groupService.removeMember(groupId, memberName);
      return true;
    } catch (err) {
      console.error("Error removing group member:", err);
      throw err;
    }
  };

  return (
    <GroupContext.Provider value={{
      groups,
      isLoading,
      error,
      addGroup,
      updateGroup,
      deleteGroup,
      getGroupById,
      addGroupMember,
      removeGroupMember
    }}>
      {children}
    </GroupContext.Provider>
  );
};

export default GroupProvider;
