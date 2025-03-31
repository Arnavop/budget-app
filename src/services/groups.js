// Mock implementation of groups service

// Mock groups data
let groupsData = [
  {
    id: '1',
    name: 'Apartment',
    icon: '🏠',
    members: ['You', 'Sam', 'Jordan'],
    expenses: ['4']
  },
  {
    id: '2',
    name: 'Vacation',
    icon: '🏖️',
    members: ['You', 'Alex', 'Sam', 'Jordan'],
    expenses: ['3']
  },
  {
    id: '3',
    name: 'Dinner Club',
    icon: '🍽️',
    members: ['You', 'Alex', 'Taylor'],
    expenses: ['1']
  }
];

const groups = {
  getAll: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...groupsData]);
      }, 300);
    });
  },
  
  getById: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const group = groupsData.find(g => g.id === id);
        if (group) {
          resolve({...group});
        } else {
          reject(new Error('Group not found'));
        }
      }, 200);
    });
  },
  
  create: async (groupData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newGroup = {
          ...groupData,
          id: Date.now().toString(),
          createdAt: new Date(),
          expenses: []
        };
        groupsData = [...groupsData, newGroup];
        resolve(newGroup);
      }, 300);
    });
  },
  
  update: async (id, groupData) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = groupsData.findIndex(g => g.id === id);
        if (index !== -1) {
          const updatedGroup = {
            ...groupsData[index],
            ...groupData,
            updatedAt: new Date()
          };
          groupsData[index] = updatedGroup;
          resolve(updatedGroup);
        } else {
          reject(new Error('Group not found'));
        }
      }, 300);
    });
  },
  
  delete: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = groupsData.length;
        groupsData = groupsData.filter(g => g.id !== id);
        
        if (groupsData.length < initialLength) {
          resolve({ success: true });
        } else {
          reject(new Error('Group not found'));
        }
      }, 200);
    });
  },
  
  addMember: async (groupId, memberName) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const group = groupsData.find(g => g.id === groupId);
        if (group) {
          if (!group.members.includes(memberName)) {
            group.members.push(memberName);
          }
          resolve({...group});
        } else {
          reject(new Error('Group not found'));
        }
      }, 200);
    });
  },
  
  removeMember: async (groupId, memberName) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const group = groupsData.find(g => g.id === groupId);
        if (group) {
          group.members = group.members.filter(m => m !== memberName);
          resolve({...group});
        } else {
          reject(new Error('Group not found'));
        }
      }, 200);
    });
  }
};

export default groups;
