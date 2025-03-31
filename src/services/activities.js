// activities.js - using mock data
import { mockActivities, generateId } from './mockData';
import { auth } from './auth';

// In-memory storage to simulate a database
let activitiesData = [...mockActivities];

const activities = {
  getAll: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Return recent activities
      return activitiesData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },
  
  create: async (activityData) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const newActivity = {
        id: generateId('activity'),
        userId: currentUser.id,
        action: activityData.action,
        resourceType: activityData.resourceType,
        resourceId: activityData.resourceId,
        metadata: activityData.metadata,
        createdAt: new Date(),
        user: {
          name: 'You'
        }
      };
      
      // Add to our in-memory database
      activitiesData.unshift(newActivity);
      
      return newActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }
};

export default activities;