import { generateId } from './mockData';
import { auth } from './auth';

let notificationsData = [];

const notifications = {
  getAll: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      return notificationsData
        .filter(notif => notif.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
  create: async (notificationData) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const newNotification = {
        id: generateId('notification'),
        userId: notificationData.userId || currentUser.id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        read: notificationData.read || false,
        actionLink: notificationData.actionLink || '',
        createdAt: new Date()
      };
      
      notificationsData.unshift(newNotification);
      
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const notificationIndex = notificationsData.findIndex(
        n => n.id === notificationId && n.userId === currentUser.id
      );
      
      if (notificationIndex === -1) {
        throw new Error('Notification not found or not authorized');
      }
      
      notificationsData[notificationIndex].read = true;
      
      return notificationsData[notificationIndex];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  delete: async (notificationId) => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const notificationIndex = notificationsData.findIndex(
        n => n.id === notificationId && n.userId === currentUser.id
      );
      
      if (notificationIndex === -1) {
        throw new Error('Notification not found or not authorized');
      }
      
      notificationsData.splice(notificationIndex, 1);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
  
  deleteAll: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      notificationsData = notificationsData.filter(n => n.userId !== currentUser.id);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
};

export default notifications;