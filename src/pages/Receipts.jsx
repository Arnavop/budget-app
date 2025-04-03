import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Receipts = () => {
  const [receipts, setReceipts] = useState([
    {
      id: 'receipt-1',
      description: 'Dinner at Olive Garden',
      date: '2023-04-15',
      amount: 78.45,
      imageUrl: null
    },
    {
      id: 'receipt-2',
      description: 'Grocery shopping',
      date: '2023-04-10',
      amount: 125.32,
      imageUrl: null
    }
  ]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [newReceiptDescription, setNewReceiptDescription] = useState('');
  const [newReceiptAmount, setNewReceiptAmount] = useState('');
  const [newReceiptDate, setNewReceiptDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const handleAddReceipt = (e) => {
    e.preventDefault();
    
    if (!newReceiptDescription || !newReceiptAmount) return;
    
    const newReceipt = {
      id: `receipt-${Date.now()}`,
      description: newReceiptDescription,
      date: newReceiptDate,
      amount: parseFloat(newReceiptAmount),
      imageUrl: null
    };
    
    setReceipts([newReceipt, ...receipts]);
    
    setNewReceiptDescription('');
    setNewReceiptAmount('');
    setIsUploading(false);
  };

  return (
    <div className="container">
      <h1>Receipts</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>Save receipts for your expenses</p>
        <Button 
          text={isUploading ? "Cancel" : "Add Receipt"} 
          onClick={() => setIsUploading(!isUploading)}
        />
      </div>
      
      {isUploading && (
        <Card style={{ marginBottom: '20px' }}>
          <h3>Add New Receipt</h3>
          <form onSubmit={handleAddReceipt}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
              <input 
                type="text"
                value={newReceiptDescription}
                onChange={(e) => setNewReceiptDescription(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--bg-tertiary)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Amount</label>
              <input 
                type="number"
                step="0.01"
                value={newReceiptAmount}
                onChange={(e) => setNewReceiptAmount(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--bg-tertiary)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
              <input 
                type="date"
                value={newReceiptDate}
                onChange={(e) => setNewReceiptDate(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--bg-tertiary)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Receipt Image</label>
              <div
                style={{ 
                  width: '100%',
                  padding: '20px',
                  borderRadius: '4px',
                  border: '2px dashed var(--bg-tertiary)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                Click to upload a receipt image (mock only)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                Supported formats: JPG, PNG, PDF (max 10MB)
              </p>
            </div>
            
            <Button text="Save Receipt" type="submit" />
          </form>
        </Card>
      )}
      
      {receipts.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧾</div>
            <h3>No Receipts</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              You haven't uploaded any receipts yet
            </p>
            <Button 
              text="Add Your First Receipt" 
              onClick={() => setIsUploading(true)}
            />
          </div>
        </Card>
      ) : (
        <div>
          {receipts.map(receipt => (
            <Card key={receipt.id} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{receipt.description}</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: '0' }}>
                    {new Date(receipt.date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  ${receipt.amount.toFixed(2)}
                </div>
              </div>
              {receipt.imageUrl ? (
                <div style={{ marginTop: '15px' }}>
                  <img 
                    src={receipt.imageUrl}
                    alt="Receipt"
                    style={{ maxWidth: '100%', borderRadius: '4px' }}
                  />
                </div>
              ) : (
                <div style={{ 
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '4px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  No image uploaded
                </div>
              )}
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  text="Delete" 
                  variant="text"
                  onClick={() => setReceipts(receipts.filter(r => r.id !== receipt.id))}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Receipts;
