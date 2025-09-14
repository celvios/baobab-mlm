import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './components/NotificationSystem';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import SecurityVerification from './pages/SecurityVerification';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Team from './pages/Team';
import TeamTree from './pages/TeamTree';
import Incentives from './pages/Incentives';
import RankingsEarnings from './pages/RankingsEarnings';
import History from './pages/History';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import BlogManagement from './pages/admin/BlogManagement';
import StagesRewards from './pages/admin/StagesRewards';
import CashoutRequests from './pages/admin/CashoutRequests';
import Emailer from './pages/admin/Emailer';

import Settings from './pages/admin/Settings';
import SkeletonLoader from './components/SkeletonLoader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <SkeletonLoader />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminProtectedRoute = ({ children }) => {
  const isAdminAuthenticated = !!localStorage.getItem('adminToken');
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

const AdminPublicRoute = ({ children }) => {
  const isAdminAuthenticated = !!localStorage.getItem('adminToken');
  return isAdminAuthenticated ? <Navigate to="/admin" replace /> : children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <SkeletonLoader />
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/security-verification" element={<PublicRoute><SecurityVerification /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="team" element={<Team />} />
            <Route path="team-tree" element={<TeamTree />} />
            <Route path="incentives" element={<Incentives />} />
            <Route path="rankings-earnings" element={<RankingsEarnings />} />
            <Route path="history" element={<History />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
          
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="stages" element={<StagesRewards />} />
            <Route path="cashout" element={<CashoutRequests />} />
            <Route path="emailer" element={<Emailer />} />

            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SettingsProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </SettingsProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;