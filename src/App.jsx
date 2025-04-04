import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Header from './components/layout/Header';
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
import Settlements from './pages/Settlements';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { GroupProvider } from './contexts/GroupContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <CurrencyProvider>
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
                      
                      {/* Protected routes with MainLayout */}
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <UserProfile />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/settlements" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Settlements />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/expenses/:id" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <ExpenseDetail />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Dashboard />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/groups" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Groups />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/groups/:id" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <GroupDetail />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/history" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <History />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/analytics" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Analytics />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/receipts" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Receipts />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Settings />
                          </MainLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                </NotificationProvider>
              </GroupProvider>
            </ExpenseProvider>
          </CurrencyProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
