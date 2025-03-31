import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Receipts from './pages/Receipts';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import ExpenseDetail from './pages/ExpenseDetail';
import GroupDetail from './pages/GroupDetail';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { GroupProvider } from './contexts/GroupContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <ExpenseProvider>
            <GroupProvider>
              <NotificationProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Add a standalone profile route */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <UserProfile />
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Dashboard />} />
                      <Route path="groups" element={<Groups />} />
                      <Route path="groups/:id" element={<GroupDetail />} />
                      <Route path="history" element={<History />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="receipts" element={<Receipts />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="expenses/:id" element={<ExpenseDetail />} />
                      <Route path="profile" element={<UserProfile />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
              </NotificationProvider>
            </GroupProvider>
          </ExpenseProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
