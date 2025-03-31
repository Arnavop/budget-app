import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import CreateSettlementModal from '../components/settlements/CreateSettlementModal';
import SettlementsList from '../components/settlements/SettlementsList';
import BalancesSummary from '../components/settlements/BalancesSummary';

const Settlements = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getBalances, getSettlements, createSettlement, completeSettlement } = useUsers();
  
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch balances and settlements on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user balances
        const balancesData = await getBalances();
        setBalances(balancesData);
        
        // Fetch settlements
        const settlementsData = await getSettlements();
        setSettlements(settlementsData);
      } catch (error) {
        console.error('Error fetching settlement data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, getBalances, getSettlements]);
  
  // Handler for creating a new settlement
  const handleCreateSettlement = async (toUserId, amount) => {
    try {
      const newSettlement = await createSettlement(currentUser.id, toUserId, amount);
      setSettlements(prev => [...prev, newSettlement]);
      
      // Refresh balances after creating a settlement
      const updatedBalances = await getBalances();
      setBalances(updatedBalances);
      
      return newSettlement;
    } catch (error) {
      console.error('Error creating settlement:', error);
      throw error;
    }
  };
  
  // Handler for marking a settlement as completed
  const handleCompleteSettlement = async (settlementId) => {
    try {
      await completeSettlement(settlementId);
      
      // Update the local state
      setSettlements(prev => 
        prev.map(settlement => 
          settlement.id === settlementId 
            ? { ...settlement, completed: true } 
            : settlement
        )
      );
      
      // Refresh balances
      const updatedBalances = await getBalances();
      setBalances(updatedBalances);
    } catch (error) {
      console.error('Error completing settlement:', error);
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
            <BalancesSummary balances={balances} />
          </div>
          
          <div style={sectionStyles}>
            <h2>Active Settlements</h2>
            <SettlementsList 
              settlements={settlements.filter(s => !s.completed)} 
              onCompleteSettlement={handleCompleteSettlement}
              isActive={true}
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