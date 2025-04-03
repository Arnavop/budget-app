import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const SettlementsList = ({ settlements, onCompleteSettlement, isActive = true }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const listStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };
  
  const emptyStyles = {
    textAlign: 'center',
    padding: '30px',
    color: 'var(--text-secondary)',
  };
  
  if (!settlements || settlements.length === 0) {
    return (
      <Card>
        <div style={emptyStyles}>
          {isActive 
            ? "No active settlements" 
            : "No completed settlements yet"}
        </div>
      </Card>
    );
  }
  
  return (
    <div style={listStyles}>
      {settlements.map(settlement => (
        <SettlementItem 
          key={settlement.id}
          settlement={settlement}
          onComplete={isActive ? onCompleteSettlement : undefined}
        />
      ))}
    </div>
  );
};

const SettlementItem = ({ settlement, onComplete }) => {
  const isIncoming = settlement.toUser === 'You';
  
  const handleMarkComplete = () => {
    if (onComplete) {
      onComplete(settlement.id);
    }
  };
  
  const cardStyles = {
    padding: '16px 20px',
    marginBottom: '0',
  };
  
  const itemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  
  const detailsStyles = {
    flex: 1,
  };
  
  const directionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  };
  
  const arrowStyles = {
    fontSize: '16px',
    color: isIncoming ? 'green' : '#ff5722',
  };
  
  const titleStyles = {
    fontSize: '16px',
    fontWeight: '500',
  };
  
  const metaStyles = {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginTop: '4px',
  };
  
  const amountStyles = {
    fontWeight: '600',
    fontSize: '18px',
    marginRight: '16px',
    color: isIncoming ? 'green' : 'inherit',
  };

  return (
    <Card style={cardStyles}>
      <div style={itemStyles}>
        <div style={detailsStyles}>
          <div style={directionStyles}>
            <span style={arrowStyles}>
              {isIncoming ? '↓' : '↑'}
            </span>
            <span style={titleStyles}>
              {isIncoming 
                ? `From ${settlement.fromUser}` 
                : `To ${settlement.toUser}`}
            </span>
          </div>
          <div style={metaStyles}>
            {settlement.completed 
              ? `Completed on ${settlement.completedDate ? new Date(settlement.completedDate).toLocaleDateString() : 'unknown date'}`
              : `Created on ${new Date(settlement.date).toLocaleDateString()}`}
          </div>
        </div>
        
        <div style={amountStyles}>
          ${settlement.amount.toFixed(2)}
        </div>
        
        {onComplete && !settlement.completed && (
          <Button 
            text="Mark Paid"
            variant="primary"
            onClick={handleMarkComplete}
          />
        )}
      </div>
    </Card>
  );
};

export default SettlementsList;