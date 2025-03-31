import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

const UserProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [color, setColor] = useState(currentUser?.color || 'blue');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (error) throw error;
          
          setProfileData(data);
          setName(data.name || '');
          setEmail(data.email || '');
          setColor(data.color || 'blue');
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProfileData();
  }, [currentUser?.id]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        name,
        color
      });
      
      // Refresh profile data after update
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
        
      if (error) throw error;
      setProfileData(data);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  if (loading) {
    return (
      <div>
        <h1 style={{ marginBottom: '20px' }}>Your Profile</h1>
        <Card>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading profile...
          </div>
        </Card>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Your Profile</h1>
      
      <Card>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={true} // Email can't be changed directly
              required
            />
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Profile Color</label>
              <select 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--bg-tertiary)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              >
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
                <option value="pink">Pink</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Button
                text="Save Changes"
                type="submit"
              />
              <Button
                text="Cancel"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              />
            </div>
          </form>
        ) : (
          <div>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'center', 
              marginBottom: '30px' 
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: profileData?.color || 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {profileData?.name ? profileData.name.charAt(0).toUpperCase() : '?'}
              </div>
              
              <div>
                <h2 style={{ margin: '0' }}>{profileData?.name}</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>
                  {profileData?.email}
                </p>
              </div>
            </div>
            
            <Button 
              text="Edit Profile" 
              onClick={() => setIsEditing(true)}
              style={{ marginBottom: '20px' }}
            />
            
            <div style={{
              padding: '15px 0',
              borderTop: '1px solid var(--bg-tertiary)',
              borderBottom: '1px solid var(--bg-tertiary)',
            }}>
              <h3 style={{ marginBottom: '10px' }}>Account Information</h3>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Member Since
                </div>
                <div>{formatDate(profileData?.created_at)}</div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Last Updated
                </div>
                <div>{formatDate(profileData?.updated_at)}</div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Profile Color
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '5px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    backgroundColor: profileData?.color || 'blue'
                  }}></div>
                  <span>{profileData?.color || 'Blue'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      <Button
        text="Back to Dashboard"
        variant="secondary"
        onClick={() => navigate('/dashboard')}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
};

export default UserProfile;
