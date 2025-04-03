import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import { useAuth } from '../hooks/useAuth';
import expenses from '../services/expenses';

const Analytics = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedView, setSelectedView] = useState(() => {
    return localStorage.getItem('analyticsView') || 'week';
  });

  useEffect(() => {
    localStorage.setItem('analyticsView', selectedView);
  }, [selectedView]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        const cachedData = localStorage.getItem('analyticsStats');
        const cachedTimestamp = localStorage.getItem('analyticsTimestamp');
        const now = new Date().getTime();
        
        if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp) < 15 * 60 * 1000)) {
          setStats(JSON.parse(cachedData));
          setLoading(false);
          
          refreshData();
          return;
        }
        
        await refreshData();
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };
    
    const refreshData = async () => {
      try {
        const expenseData = await expenses.getAll();
        
        const categoryMap = {};
        let totalSpent = 0;
        
        expenseData.forEach(expense => {
          const { category, amount } = expense;
          totalSpent += amount;
          
          if (!categoryMap[category]) {
            categoryMap[category] = 0;
          }
          categoryMap[category] += amount;
        });
        
        const categoryColors = {
          'Food': '#4CAF50',
          'Transport': '#2196F3',
          'Entertainment': '#FF9800',
          'Utilities': '#9C27B0',
          'Other': '#607D8B'
        };
        
        const categories = Object.keys(categoryMap).map(category => {
          const amount = categoryMap[category];
          const percentage = Math.round((amount / totalSpent) * 100) || 0;
          
          return {
            name: category,
            percentage,
            amount,
            color: categoryColors[category] || '#607D8B'
          };
        });
        
        const today = new Date();
        const dailySpending = {};
        const last30Days = [];
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailySpending[dateStr] = 0;
          last30Days.push(dateStr);
        }
        
        expenseData.forEach(expense => {
          const expenseDate = new Date(expense.date).toISOString().split('T')[0];
          if (dailySpending[expenseDate] !== undefined) {
            dailySpending[expenseDate] += expense.amount;
          }
        });
        
        const dailySpendingArray = last30Days.map(date => ({
          date,
          amount: dailySpending[date]
        }));
        
        const avgPerDay = totalSpent / 30;
        const spendingValues = Object.values(dailySpending);
        const maxDay = Math.max(...spendingValues);
        const minDay = Math.min(...spendingValues);
        
        const newStats = {
          categories,
          dailySpending: dailySpendingArray,
          summary: {
            totalSpent,
            avgPerDay,
            maxDay,
            minDay
          }
        };
        
        localStorage.setItem('analyticsStats', JSON.stringify(newStats));
        localStorage.setItem('analyticsTimestamp', new Date().getTime().toString());
        
        setStats(newStats);
        setLoading(false);
      } catch (error) {
        console.error('Error refreshing analytics data:', error);
        setLoading(false);
      }
    };
    
    fetchStats();
    
    const handleExpenseChange = () => {
      refreshData();
    };
    
    window.addEventListener('expenseAdded', handleExpenseChange);
    window.addEventListener('expenseDeleted', handleExpenseChange);
    window.addEventListener('expenseUpdated', handleExpenseChange);
    
    return () => {
      window.removeEventListener('expenseAdded', handleExpenseChange);
      window.removeEventListener('expenseDeleted', handleExpenseChange);
      window.removeEventListener('expenseUpdated', handleExpenseChange);
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="container">
        <h1>Analytics</h1>
        <Card>
          <div style={{ textAlign: 'center', padding: '30px' }}>
            Loading analytics...
          </div>
        </Card>
      </div>
    );
  }

  const renderBarChart = (data, labelKey, valueKey) => {
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    return (
      <div style={{ marginTop: '20px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ marginRight: '10px', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {typeof item[labelKey] === 'string' && item[labelKey].includes('-') 
                  ? new Date(item[labelKey]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : item[labelKey]}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  height: '20px',
                  width: maxValue ? `${(item[valueKey] / maxValue) * 100}%` : '0%',
                  backgroundColor: item.color || 'var(--accent)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {item[valueKey] > 0 ? `$${item[valueKey].toFixed(2)}` : ''}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPieChart = (categories) => {
    let cumulativePercentage = 0;
    
    return (
      <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
        {categories.map((category, index) => {
          const startAngle = cumulativePercentage * 3.6;
          cumulativePercentage += category.percentage;
          const endAngle = cumulativePercentage * 3.6;
          
          const x1 = 100 + 80 * Math.cos(Math.PI * startAngle / 180);
          const y1 = 100 + 80 * Math.sin(Math.PI * startAngle / 180);
          const x2 = 100 + 80 * Math.cos(Math.PI * endAngle / 180);
          const y2 = 100 + 80 * Math.sin(Math.PI * endAngle / 180);
          
          const largeArcFlag = category.percentage > 50 ? 1 : 0;
          
          return (
            <svg key={index} width="200" height="200" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path
                d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={category.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          );
        })}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            Total
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            ${stats.summary.totalSpent.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  const getFilteredSpendingData = () => {
    if (!stats) return [];
    
    const today = new Date();
    let daysToShow = 7;
    
    if (selectedView === 'month') {
      daysToShow = 30;
    } else if (selectedView === 'year') {
      daysToShow = 365;
    }
    
    return stats.dailySpending.slice(-daysToShow);
  };

  return (
    <div className="container">
      <h1>Analytics</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <Card style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>Total Spent</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
            ${stats.summary.totalSpent.toFixed(2)}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Last 30 days
          </div>
        </Card>
        
        <Card style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>Daily Average</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
            ${stats.summary.avgPerDay.toFixed(2)}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Per day
          </div>
        </Card>
        
        <Card style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>Highest Day</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
            ${stats.summary.maxDay.toFixed(2)}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Single day max
          </div>
        </Card>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', marginBottom: '20px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Spending by Category</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              {stats.categories.length > 0 ? renderPieChart(stats.categories) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  No expense data available
                </div>
              )}
            </div>
            
            <div>
              {stats.categories.length > 0 ? (
                stats.categories.map((category, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div 
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: category.color,
                          marginRight: '8px',
                          borderRadius: '2px'
                        }} 
                      />
                      <span>{category.name}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold', marginRight: '5px' }}>
                        ${category.amount.toFixed(2)}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        ({category.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)' }}>
                  No categories to display
                </div>
              )}
            </div>
          </div>
        </Card>
        
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Spending Over Time</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSelectedView('week')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: selectedView === 'week' ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: selectedView === 'week' ? 'white' : 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedView('month')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: selectedView === 'month' ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: selectedView === 'month' ? 'white' : 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Month
              </button>
              <button
                onClick={() => setSelectedView('year')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: selectedView === 'year' ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: selectedView === 'year' ? 'white' : 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Year
              </button>
            </div>
          </div>
          
          {renderBarChart(getFilteredSpendingData(), 'date', 'amount')}
        </Card>
      </div>
    </div>
  );
};

export default Analytics;