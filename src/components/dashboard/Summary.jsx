import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useUsers } from '../../hooks/useUsers';

const Summary = () => {
  const [activeTab, setActiveTab] = useState('balances');
  const { users } = useUsers();

  const cardTitleStyles = {
    fontSize: '18px', 
    marginBottom: '15px'
  };

  const summaryRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--bg-tertiary)',
  };

  const summaryItemStyles = {
    display: 'flex',
    flexDirection: 'column',
  };

  const summaryLabelStyles = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  };

  const summaryValueStyles = {
    fontSize: '20px',
    fontWeight: 'bold',
  };

  const positiveAmountStyles = {
    color: 'var(--success)',
  };

  const tabsStyles = {
    display: 'flex',
    borderBottom: '1px solid var(--bg-tertiary)',
    marginBottom: '15px',
  };

  const tabStyles = (isActive) => ({
    padding: '10px 15px',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid var(--accent-light)' : '2px solid transparent',
    color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
  });

  const tabContentStyles = (isActive) => ({
    display: isActive ? 'block' : 'none',
  });

  const balanceListStyles = {
    marginTop: '15px',
  };

  const balanceItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--bg-tertiary)',
  };

  const balancePersonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const personAvatarStyles = (color) => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '12px',
  });

  const balanceAmountStyles = {
    fontWeight: 'bold',
  };

  const settlementsListStyles = {
    marginTop: '15px',
  };

  const settlementItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    padding: '10px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '6px',
  };

  const settlementArrowStyles = {
    color: 'var(--text-secondary)',
  };

  return (
    <Card>
      <div style={cardTitleStyles}>Summary</div>
      
      <div style={summaryRowStyles}>
        <div style={summaryItemStyles}>
          <div style={summaryLabelStyles}>Total Expenses</div>
          <div style={summaryValueStyles}>$458.20</div>
        </div>
        <div style={summaryItemStyles}>
          <div style={summaryLabelStyles}>Your Balance</div>
          <div style={{...summaryValueStyles, ...positiveAmountStyles}}>+$72.50</div>
        </div>
      </div>
      
      <div style={tabsStyles}>
        <div 
          style={tabStyles(activeTab === 'balances')} 
          onClick={() => setActiveTab('balances')}
        >
          Balances
        </div>
        <div 
          style={tabStyles(activeTab === 'settlements')} 
          onClick={() => setActiveTab('settlements')}
        >
          Settlements
        </div>
      </div>
      
      <div style={tabContentStyles(activeTab === 'balances')}>
        <div style={balanceListStyles}>
          {users.filter(user => user.name !== 'You').map(user => (
            <div key={user.id} style={balanceItemStyles}>
              <div style={balancePersonStyles}>
                <div style={personAvatarStyles(user.color)}>{user.avatar}</div>
                <span>{user.name}</span>
              </div>
              <div style={{...balanceAmountStyles, ...positiveAmountStyles}}>
                {user.name === 'Alex' && '+$35.60'}
                {user.name === 'Sam' && '+$24.30'}
                {user.name === 'Jordan' && '+$12.60'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={tabContentStyles(activeTab === 'settlements')}>
        <div style={settlementsListStyles}>
          {users.filter(user => user.name !== 'You').map(user => (
            <div key={user.id} style={settlementItemStyles}>
              <div style={personAvatarStyles(user.color)}>{user.avatar}</div>
              <span>{user.name}</span>
              <span style={settlementArrowStyles}>→</span>
              <div style={personAvatarStyles('var(--accent)')}>Y</div>
              <span>You</span>
              <div style={balanceAmountStyles}>
                {user.name === 'Alex' && '$35.60'}
                {user.name === 'Sam' && '$24.30'}
                {user.name === 'Jordan' && '$12.60'}
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          text="Remind All"
          style={{marginTop: '15px'}}
        />
      </div>
    </Card>
  );
};

export default Summary;
