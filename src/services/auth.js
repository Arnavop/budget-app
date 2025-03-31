// Auth service using Supabase
import { supabase } from '../supabase/client';

// Helper function to persist user state to localStorage
const saveUserToLocalStorage = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

// Helper function to get user from localStorage
const getUserFromLocalStorage = () => {
  const storedUser = localStorage.getItem('currentUser');
  return storedUser ? JSON.parse(storedUser) : null;
};

const auth = {
  currentUser: getUserFromLocalStorage(),
  
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        // Fetch the user's profile from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const user = {
          id: data.user.id,
          name: profileData.name,
          email: profileData.email,
          color: profileData.color,
          avatar: profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'
        };
        
        auth.currentUser = user;
        saveUserToLocalStorage(user);
        return user;
      }
      
      throw new Error('User data not found');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        // Explicitly create profile record after successful signup
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: name,
            email: email,
            color: 'blue', // Default color
            created_at: new Date(),
            updated_at: new Date()
          });
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue anyway since the auth user was created
        }
        
        const user = {
          id: data.user.id,
          name: name,
          email: data.user.email,
          color: 'blue', // Default color
          avatar: name.charAt(0).toUpperCase()
        };
        
        auth.currentUser = user;
        saveUserToLocalStorage(user);
        return user;
      }
      
      throw new Error('User data not found');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      // Get the current Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const userId = session.user.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          color: profileData.color,
          updated_at: new Date(),
        })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local user data
      const updatedUser = {
        ...(auth.currentUser || {}),
        id: userId,
        name: profileData.name,
        color: profileData.color,
        avatar: profileData.name.charAt(0).toUpperCase()
      };
      
      auth.currentUser = updatedUser;
      saveUserToLocalStorage(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      auth.currentUser = null;
      saveUserToLocalStorage(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      // First check if we already have the current user in memory
      if (auth.currentUser) return auth.currentUser;
      
      // Then check localStorage
      const localUser = getUserFromLocalStorage();
      if (localUser) {
        auth.currentUser = localUser;
        // Validate with Supabase session but return immediately to avoid loading state
        auth.validateSession();
        return localUser;
      }
      
      // Otherwise check if there's an active session
      return await auth.validateSession();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  // Separate method to validate the session
  validateSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session found, clear any stale user data
        auth.currentUser = null;
        saveUserToLocalStorage(null);
        return null;
      }
      
      // Fetch the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // If we can't get profile data but have a session, create a minimal user object
        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 'User',
          color: 'blue',
          avatar: (session.user.user_metadata?.name || 'U').charAt(0).toUpperCase()
        };
        
        auth.currentUser = user;
        saveUserToLocalStorage(user);
        return user;
      }
      
      // We have both session and profile data
      const user = {
        id: session.user.id,
        name: profileData.name,
        email: profileData.email,
        color: profileData.color,
        avatar: profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'
      };
      
      auth.currentUser = user;
      saveUserToLocalStorage(user);
      return user;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  },
  
  onAuthStateChanged: (callback) => {
    // First, return user from localStorage to prevent loading flicker
    const localUser = getUserFromLocalStorage();
    if (localUser) {
      setTimeout(() => {
        callback(localUser);
      }, 0);
    }
    
    // Then, validate with Supabase
    auth.getCurrentUser().then(user => {
      callback(user);
    });
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          // Fetch the user's profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!profileError && profileData) {
            const user = {
              id: session.user.id,
              name: profileData.name,
              email: profileData.email,
              color: profileData.color,
              avatar: profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'
            };
            
            auth.currentUser = user;
            saveUserToLocalStorage(user);
            callback(user);
          } else {
            // Fallback if profile not found
            const user = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || 'User',
              color: 'blue',
              avatar: (session.user.user_metadata?.name || 'U').charAt(0).toUpperCase()
            };
            
            auth.currentUser = user;
            saveUserToLocalStorage(user);
            callback(user);
          }
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          auth.currentUser = null;
          saveUserToLocalStorage(null);
          callback(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Session token refreshed, maintain the current user
          if (auth.currentUser) {
            callback(auth.currentUser);
          } else {
            // If somehow we don't have the current user, fetch it
            const user = await auth.getCurrentUser();
            callback(user);
          }
        }
      }
    );
    
    // Return unsubscribe function
    return () => {
      authListener.subscription.unsubscribe();
    };
  },
  
  // Add password reset request function
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  
  // Update password function
  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }
};

export { auth };