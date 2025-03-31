import React, { useState } from 'react';
import AddExpenseForm from '../components/dashboard/AddExpenseForm';
import ExpenseList from '../components/dashboard/ExpenseList';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import Summary from '../components/dashboard/Summary';
import GroupsList from '../components/dashboard/GroupsList';
import Modal from '../components/common/Modal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Toast from '../components/common/Toast';
import { useNotifications } from '../hooks/useNotifications';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const { addNotification } = useNotifications();

  const mainContentStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '20px',
  };

  const contentLeftStyles = {};
  const contentRightStyles = {};

  const handleExpenseSubmit = () => {
    setShowModal(false);
    addNotification({
      message: 'Expense added successfully!',
      type: 'toast',
      severity: 'success',
      duration: 5000
    });
  };

  return (
    <div>
      <div style={mainContentStyles}>
        <div style={contentLeftStyles}>
          <AddExpenseForm onShowFullForm={() => setShowModal(true)} />
          <ExpenseList />
          <ActivityFeed />
        </div>
        <div style={contentRightStyles}>
          <Summary />
          <GroupsList />
        </div>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Add Expense"
      >
        <ExpenseForm onSubmit={handleExpenseSubmit} />
      </Modal>
      
      <Toast />
    </div>
  );
};

export default Dashboard;
