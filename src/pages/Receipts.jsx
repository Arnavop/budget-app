import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Receipts = () => {
  // Mock receipt data for demonstration
  const mockReceipts = [
    { id: 1, name: 'Grocery receipt', date: '2023-04-01', uploaded: true },
    { id: 2, name: 'Restaurant bill', date: '2023-03-28', uploaded: true },
    { id: 3, name: 'Movie tickets', date: '2023-03-26', uploaded: true },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Receipts</h1>
      
      <Card>
        <div style={{
          border: '2px dashed var(--bg-tertiary)',
          borderRadius: '4px',
          padding: '30px',
          textAlign: 'center',
          marginBottom: '20px',
          cursor: 'pointer',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📷</div>
          <h3>Upload Receipt</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Drag and drop files here or click to browse
          </p>
        </div>
      </Card>
      
      <h2 style={{ marginBottom: '15px', marginTop: '30px' }}>Recent Receipts</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
      }}>
        {mockReceipts.map((receipt) => (
          <Card key={receipt.id} style={{ padding: '15px' }}>
            <div style={{
              width: '100%',
              height: '120px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              marginBottom: '10px',
            }}>
              📄
            </div>
            <h3 style={{ margin: '5px 0' }}>{receipt.name}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '5px 0' }}>
              {receipt.date}
            </p>
            <Button text="View Details" style={{ marginTop: '10px', width: '100%' }} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Receipts;
