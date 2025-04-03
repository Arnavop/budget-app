import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { useExpenses } from '../hooks/useExpenses';
import CreateSettlementModal from '../components/settlements/CreateSettlementModal';
import SettlementsList from '../components/settlements/SettlementsList';
import BalancesSummary from '../components/settlements/BalancesSummary';

const Settlements = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getBalances, getSettlements, createSettlement, completeSettlement, calculateBalancesFromExpenses } = useUsers();
  const { expenses, deleteExpense } = useExpenses();
  
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const loadSettlementData = async () => {
    try {
      setLoading(true);
      
      // Remove the direct call to calculateBalancesFromExpenses() here to prevent infinite loop
      // balances will be fetched directly via getBalances()
      
      const balancesData = await getBalances();
      setBalances(balancesData);
      
      const settlementsData = await getSettlements();
      setSettlements(settlementsData);
    } catch (error) {
      console.error('Error fetching settlement data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      loadSettlementData();
    }
  }, [currentUser, expenses]);
  
  // We'll keep this event listener but make sure it doesn't cause an infinite loop
  // by adding a check to prevent reloading when the data is already loading
  useEffect(() => {
    const handleBalancesUpdated = () => {
      // Only reload data if we're not currently loading to prevent infinite loops
      if (!loading) {
        loadSettlementData();
      }
    };
    
    window.addEventListener('balancesUpdated', handleBalancesUpdated);
    
    return () => {
      window.removeEventListener('balancesUpdated', handleBalancesUpdated);
    };
  }, [loading]); // Add loading as a dependency
  
  const handleCreateSettlement = async (toUserId, amount) => {
    try {
      const newSettlement = await createSettlement(currentUser.id, toUserId, amount);
      setSettlements(prev => [...prev, newSettlement]);
      
      const updatedBalances = await getBalances();
      setBalances(updatedBalances);
      
      return newSettlement;
    } catch (error) {
      console.error('Error creating settlement:', error);
      throw error;
    }
  };
  
  const handleCompleteSettlement = async (settlementId, toUserId, amount) => {
    try {
      // If settlementId is null, it means we're creating a new settlement
      if (settlementId === null && toUserId && amount) {
        return handleCreateSettlement(toUserId, amount);
      }
      
      // Otherwise, we're completing an existing settlement
      await completeSettlement(settlementId);
      
      setSettlements(prev => 
        prev.map(settlement => 
          settlement.id === settlementId 
            ? { ...settlement, completed: true } 
            : settlement
        )
      );
      
      const updatedBalances = await getBalances();
      setBalances(updatedBalances);
    } catch (error) {
      console.error('Error handling settlement:', error);
    }
  };
  
  const handleSettleUp = async (userId, amount) => {
    try {
      // Find the user in the balances array to get their name
      const userData = balances.find(b => b.userId === userId);
      if (!userData) {
        throw new Error('User not found in balances');
      }
      
      // Create a new settlement directly marked as completed
      const newSettlement = {
        id: `settlement-${Date.now()}`,
        fromUserId: currentUser.id,
        toUserId: userId,
        toUserName: userData.name,
        amount: Math.abs(parseFloat(amount)),
        created: new Date(),
        completed: true
      };
      
      // Find related expenses between these users
      const relatedExpenses = expenses.filter(expense => {
        // User A paid for User B
        if (expense.paidBy === 'You' && expense.splitWith && expense.splitWith.includes(userData.name)) {
          return true;
        }
        // User B paid for User A
        if (expense.paidBy === userData.name && expense.splitWith && expense.splitWith.includes('You')) {
          return true;
        }
        return false;
      });
      
      // Delete related expenses
      for (const expense of relatedExpenses) {
        await deleteExpense(expense.id);
      }
      
      // Add the settlement to the list
      const updatedSettlements = [newSettlement, ...settlements];
      setSettlements(updatedSettlements);
      
      // Update localStorage
      localStorage.setItem('budget_app_settlements', JSON.stringify(updatedSettlements));
      
      // Recalculate balances
      await calculateBalancesFromExpenses();
      
      // Refresh data
      const updatedBalances = await getBalances();
      setBalances(updatedBalances);
      
      // Trigger events to update other components
      window.dispatchEvent(new CustomEvent('balancesUpdated'));
      window.dispatchEvent(new CustomEvent('expensesUpdated'));
      
      return newSettlement;
    } catch (error) {
      console.error('Error settling up:', error);
      throw error;
    }
  };

  const pageStyles = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  };
  
  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };
  
  const sectionStyles = {
    marginBottom: '30px',
  };
  
  const loadingStyles = {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary)',
  };

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1>Settlements</h1>
        <Button 
          text="New Settlement" 
          onClick={() => setShowCreateModal(true)}
        />
      </div>
      
      {loading ? (
        <Card>
          <div style={loadingStyles}>Loading settlements data...</div>
        </Card>
      ) : (
        <>
          <div style={sectionStyles}>
            <BalancesSummary 
              balances={balances} 
              onCreateSettlement={handleCreateSettlement}
              renderActions={(balance) => (
                balance.balance !== 0 && (
                  <Button 
                    text="Settle Up" 
                    onClick={() => handleSettleUp(balance.userId, balance.balance)}
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      fontSize: '14px',
                      padding: '6px 12px',
                    }}
                  />
                )
              )}
            />
          </div>
          
          
          <div style={sectionStyles}>
            <h2>Settlement History</h2>
            <SettlementsList 
              settlements={settlements.filter(s => s.completed)} 
              isActive={false}
            />
          </div>
        </>
      )}
      
      {showCreateModal && (
        <CreateSettlementModal 
          onClose={() => setShowCreateModal(false)}
          onCreateSettlement={handleCreateSettlement}
          balances={balances.filter(b => b.balance < 0)}
        />
      )}
    </div>
  );
};

export default Settlements;