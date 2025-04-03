import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';

const STORAGE_KEY = 'budget_app_recent_expenses';
const ACTIVITY_STORAGE_KEY = 'budget_app_activities';

const ActivityFeed = () => {
  const [activityItems, setActivityItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const loadActivities = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      let activitiesData = storedActivities ? JSON.parse(storedActivities) : [];
      
      const storedExpenses = localStorage.getItem(STORAGE_KEY);
      if (storedExpenses) {
        const expenses = JSON.parse(storedExpenses);
        
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
          createdAt: expense.date
        }));
        
        activitiesData = [...expenseActivities, ...activitiesData];
      }
      
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activitiesData));
      
      const formattedActivities = await Promise.all(activitiesData.map(async (activity) => {
        const isCurrentUser = activity.userId === currentUser.id;
        
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
        } else if (activity.resourceType === 'group') {
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
          const amount = activity.metadata?.amount ?? 0;
          
          if (activity.action === 'created') {
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
          title = `${actor} ${activity.action} ${activity.resourceType}`;
        }
        
        return {
          id: activity.id,
          title,
          timestamp: new Date(activity.createdAt)
        };
      }));
      
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

  const addActivity = (activity) => {
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
    
    setActivityItems(prev => {
      const updated = [formattedActivity, ...prev];
      return updated
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);
    });
    
    try {
      const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      const activities = storedActivities ? JSON.parse(storedActivities) : [];
      activities.unshift(activity);
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities.slice(0, 50)));
    } catch (error) {
      console.error('Error updating activities in localStorage:', error);
    }
  };
  
  useEffect(() => {
    const handleExpenseAdded = (event) => {
      const expense = event.detail;
      
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
      
      const activity = {
        id: `expense-delete-${id}-${Date.now()}`,
        action: 'deleted',
        resourceType: 'expense',
        resourceId: id,
        userId: currentUser?.id,
        user: { name: 'You' },
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

  const cardStyle = {
    padding: 0,
    overflow: 'hidden'
  };
  
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
