import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser); // Initialize with localStorage value
  const [loading, setLoading] = useState(!auth.currentUser); // Only show loading if no user in localStorage

  useEffect(() => {
    // Set up the auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup the listener
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const user = await auth.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const user = await auth.register(name, email, password);
    setCurrentUser(user);
    return user;
  };

  const updateProfile = async (profileData) => {
    const updatedUser = await auth.updateProfile(profileData);
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    await auth.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    updateProfile,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
