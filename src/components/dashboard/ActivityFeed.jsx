import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';
import activities from '../../services/activities';

const STORAGE_KEY = 'budget_app_recent_expenses';
const ACTIVITY_STORAGE_KEY = 'budget_app_activities';

const ActivityFeed = () => {
  const [activityItems, setActivityItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Function to load activities and create them based on expense data
  const loadActivities = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // First, try to get activities from localStorage
      const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      let activitiesData = storedActivities ? JSON.parse(storedActivities) : [];
      
      // If no activities found, create from expenses and service
      if (activitiesData.length === 0) {
        // Get some activities from service
        const serviceActivities = await activities.getAll();
        activitiesData = serviceActivities;
        
        // Also create activities based on stored expenses
        const storedExpenses = localStorage.getItem(STORAGE_KEY);
        if (storedExpenses) {
          const expenses = JSON.parse(storedExpenses);
          
          // Create an "added" activity for each expense
          const expenseActivities = expenses.map(expense => ({
            id: `expense-${expense.id}`,
            action: 'created',
            resourceType: 'expense',
            resourceId: expense.id,
            userId: expense.paidByUserId || currentUser.id,
            user: { name: expense.paidBy },
            metadata: {
              description: expense.description,
              amount: expense.amount
            },
            createdAt: expense.date // Use the expense date as activity date
          }));
          
          // Combine with service activities
          activitiesData = [...expenseActivities, ...activitiesData];
        }
        
        // Save to localStorage
        localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activitiesData));
      }
      
      // Format activities
      const formattedActivities = await Promise.all(activitiesData.map(async (activity) => {
        // Determine if this activity was by the current user
        const isCurrentUser = activity.userId === currentUser.id;
        
        // Use the actor name from activity data
        const actor = isCurrentUser ? 'You' : (activity.user?.name || 'Someone');
        
        // Different formatting based on action and resource type
        let title = '';
        if (activity.resourceType === 'expense') {
          // Get expense name from metadata
          const expenseName = activity.metadata?.description || 'an expense';
          
          switch (activity.action) {
            case 'created':
              title = `${actor} added "${expenseName}" expense`;
              break;
            case 'updated':
              title = `${actor} updated "${expenseName}" expense`;
              break;
            case 'deleted':
              title = `${actor} deleted "${expenseName}" expense`;
              break;
            default:
              title = `${actor} ${activity.action} expense "${expenseName}"`;
          }
        } else if (activity.resourceType === 'group') {
          // Get group name from metadata
          const groupName = activity.metadata?.name || 'a group';
          
          switch (activity.action) {
            case 'created':
              title = `${actor} created "${groupName}" group`;
              break;
            case 'updated':
              title = `${actor} updated "${groupName}" group`;
              break;
            case 'deleted':
              title = `${actor} deleted "${groupName}" group`;
              break;
            default:
              title = `${actor} ${activity.action} group "${groupName}"`;
          }
        } else if (activity.resourceType === 'settlement') {
          // Get settlement data
          const amount = activity.metadata?.amount ?? 0;
          
          if (activity.action === 'created') {
            // Determine if current user is sender or receiver
            const fromUserId = activity.metadata?.fromUserId;
            const toUserId = activity.metadata?.toUserId;
            
            if (fromUserId === currentUser.id) {
              const toName = activity.metadata?.toUser || 'someone';
              title = `${actor} created a settlement to pay ${toName} $${amount.toFixed(2)}`;
            } else if (toUserId === currentUser.id) {
              const fromName = activity.metadata?.fromUser || 'Someone';
              title = `${fromName} created a settlement to pay you $${amount.toFixed(2)}`;
            } else {
              title = `${actor} created a settlement for $${amount.toFixed(2)}`;
            }
          } else if (activity.action === 'completed') {
            title = `${actor} completed a settlement of $${amount.toFixed(2)}`;
          } else if (activity.action === 'reminder') {
            title = `${actor} sent a payment reminder`;
          } else {
            title = `${actor} ${activity.action} settlement`;
          }
        } else {
          // Generic fallback
          title = `${actor} ${activity.action} ${activity.resourceType}`;
        }
        
        return {
          id: activity.id,
          title,
          timestamp: new Date(activity.createdAt)
        };
      }));
      
      // Sort activities by date (newest first)
      formattedActivities.sort((a, b) => b.timestamp - a.timestamp);
      
      setActivityItems(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadActivities();
  }, [currentUser]);

  // Create function to add new activity
  const addActivity = (activity) => {
    // Format the new activity 
    const isCurrentUser = activity.userId === currentUser?.id;
    const actor = isCurrentUser ? 'You' : (activity.user?.name || 'Someone');
    
    let title = '';
    if (activity.resourceType === 'expense') {
      const expenseName = activity.metadata?.description || 'an expense';
      
      switch (activity.action) {
        case 'created':
          title = `${actor} added "${expenseName}" expense`;
          break;
        case 'updated':
          title = `${actor} updated "${expenseName}" expense`;
          break;
        case 'deleted':
          title = `${actor} deleted "${expenseName}" expense`;
          break;
        default:
          title = `${actor} ${activity.action} expense "${expenseName}"`;
      }
    }
    
    const formattedActivity = {
      id: activity.id,
      title,
      timestamp: new Date(activity.createdAt || new Date())
    };
    
    // Add to activity list
    setActivityItems(prev => {
      const updated = [formattedActivity, ...prev];
      // Sort and keep only the most recent ones
      return updated
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20); // Keep a reasonable number
    });
    
    // Update localStorage
    try {
      const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      const activities = storedActivities ? JSON.parse(storedActivities) : [];
      activities.unshift(activity); // Add to beginning
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities.slice(0, 50)));
    } catch (error) {
      console.error('Error updating activities in localStorage:', error);
    }
  };
  
  // Listen for expense events to add corresponding activities
  useEffect(() => {
    const handleExpenseAdded = (event) => {
      const expense = event.detail;
      
      // Create an activity for the new expense
      const activity = {
        id: `expense-${expense.id}-${Date.now()}`,
        action: 'created',
        resourceType: 'expense',
        resourceId: expense.id,
        userId: expense.paidByUserId || currentUser?.id,
        user: { name: expense.paidBy },
        metadata: {
          description: expense.description,
          amount: expense.amount
        },
        createdAt: new Date().toISOString()
      };
      
      addActivity(activity);
    };
    
    const handleExpenseUpdated = (event) => {
      const expense = event.detail;
      
      // Create an activity for the updated expense
      const activity = {
        id: `expense-update-${expense.id}-${Date.now()}`,
        action: 'updated',
        resourceType: 'expense',
        resourceId: expense.id,
        userId: expense.paidByUserId || currentUser?.id,
        user: { name: expense.paidBy },
        metadata: {
          description: expense.description,
          amount: expense.amount
        },
        createdAt: new Date().toISOString()
      };
      
      addActivity(activity);
    };
    
    const handleExpenseDeleted = (event) => {
      const { id } = event.detail;
      
      // Since we don't have the expense details anymore, create a generic activity
      const activity = {
        id: `expense-delete-${id}-${Date.now()}`,
        action: 'deleted',
        resourceType: 'expense',
        resourceId: id,
        userId: currentUser?.id,
        user: { name: 'You' }, // Assume current user did the deletion
        metadata: {},
        createdAt: new Date().toISOString()
      };
      
      addActivity(activity);
    };
    
    window.addEventListener('expenseAdded', handleExpenseAdded);
    window.addEventListener('expenseUpdated', handleExpenseUpdated);
    window.addEventListener('expenseDeleted', handleExpenseDeleted);
    
    return () => {
      window.removeEventListener('expenseAdded', handleExpenseAdded);
      window.removeEventListener('expenseUpdated', handleExpenseUpdated);
      window.removeEventListener('expenseDeleted', handleExpenseDeleted);
    };
  }, [currentUser]);

  // Card style
  const cardStyle = {
    padding: 0,
    overflow: 'hidden'
  };
  
  // Activity item styles
  const itemStyles = {
    padding: '15px 20px',
    borderBottom: '1px solid var(--bg-tertiary)',
    position: 'relative'
  };
  
  const itemTitleStyles = {
    margin: '0 0 5px 0',
    fontSize: '15px',
    fontWeight: 'normal'
  };
  
  const timeStyles = {
    color: 'var(--text-secondary)',
    fontSize: '13px'
  };

  return (
    <Card style={cardStyle}>
      <div style={{ borderBottom: '1px solid var(--bg-tertiary)', padding: '15px 20px' }}>
        <h3 style={{ margin: 0 }}>Recent Activity</h3>
      </div>
      
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : activityItems.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>No recent activity</div>
      ) : (
        <div>
          {activityItems.slice(0, 5).map(activity => (
            <div key={activity.id} style={itemStyles}>
              <h4 style={itemTitleStyles}>{activity.title}</h4>
              <div style={timeStyles}>
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActivityFeed;
