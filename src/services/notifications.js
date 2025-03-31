// notifications.js - using mock data
import { generateId } from './mockData';
import { auth } from './auth';

// In-memory storage to simulate a database
let notificationsData = [
  {
    id: 'notification-1',
    userId: 'user-1',
    type: 'reminder',
    title: 'Payment Reminder',
    message: 'You have an outstanding payment of $43.20 to You',
    read: false,
    actionLink: '/settlements',
    createdAt: '2023-04-03T12:30:00Z'
  },
  {
    id: 'notification-2',
    userId: 'user-1',
    type: 'expense',
    title: 'New Expense Added',
    message: 'Sam added an expense "Lunch" for $42.75',
    read: true,
    actionLink: '/expenses/expense-5',
    createdAt: '2023-03-28T13:20:00Z'
  },
  {
    id: 'notification-3',
    userId: 'user-1',
    type: 'group',
    title: 'Added to Group',
    message: 'Alex added you to "Trip to Vegas" group',
    read: false,
    actionLink: '/dashboard/groups/group-2',
    createdAt: '2023-03-20T14:35:00Z'
  }
];

const notifications = {
  getAll: async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Return notifications for the current user, sorted by date (newest first)
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
      
      // Add to our in-memory database
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
      
      // Mark as read
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
      
      // Remove from our in-memory database
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
      
      // Remove all notifications for the current user
      notificationsData = notificationsData.filter(n => n.userId !== currentUser.id);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
};

export default notifications;