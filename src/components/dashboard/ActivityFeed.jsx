import React from 'react';
import Card from '../common/Card';

const ActivityFeed = () => {
  // Mock activity feed data
  const activities = [
    {
      id: 1,
      title: 'Alex settled $35.60 with you',
      time: '2 hours ago'
    },
    {
      id: 2,
      title: 'You added "Grocery shopping" expense',
      time: 'Today, 10:23 AM'
    },
    {
      id: 3,
      title: 'Sam commented on "Electricity bill"',
      time: 'Yesterday, 8:45 PM'
    },
    {
      id: 4,
      title: 'Jordan joined the "Apartment" group',
      time: 'Mar 27, 2:15 PM'
    }
  ];

  const cardTitleStyles = {
    fontSize: '18px', 
    marginBottom: '15px'
  };

  const activityFeedStyles = {
    marginTop: '15px',
  };

  const activityItemStyles = {
    display: 'flex',
    gap: '15px',
    padding: '12px 0',
    borderBottom: '1px solid var(--bg-tertiary)',
  };

  const activityTimelineStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const activityDotStyles = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
  };

  const activityLineStyles = {
    width: '2px',
    height: '100%',
    backgroundColor: 'var(--bg-tertiary)',
  };

  const activityContentStyles = {
    flex: 1,
  };

  const activityTitleStyles = {
    fontWeight: '500',
  };

  const activityTimeStyles = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '3px',
  };

  return (
    <Card>
      <div style={cardTitleStyles}>Activity Feed</div>
      
      <div style={activityFeedStyles}>
        {activities.map((activity, index) => (
          <div key={activity.id} style={activityItemStyles}>
            <div style={activityTimelineStyles}>
              <div style={activityDotStyles}></div>
              <div style={activityLineStyles}></div>
            </div>
            <div style={activityContentStyles}>
              <div style={activityTitleStyles}>{activity.title}</div>
              <div style={activityTimeStyles}>{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityFeed;
