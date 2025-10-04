import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './components/NotificationSystem';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './contexts/CartContext';
// import { SettingsProvider } from './contexts/SettingsContext';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import SecurityVerification from './pages/SecurityVerification';
import ResetPassword from './pages/ResetPassword';
import Logout from './pages/Logout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Team from './pages/Team';
import TeamTree from './pages/TeamTree';
import Incentives from './pages/Incentives';
import RankingsEarnings from './pages/RankingsEarnings';
import History from './pages/History';
import SkeletonLoader from './components/SkeletonLoader';
import {
  AdminLogin,
  AdminDashboard,
  AdminUsersManagement,
  AdminOrdersManagement,
  AdminProductManagement,
  AdminWithdrawals,
  AdminEmailer,
  AdminBlogManagement,
  AdminSettings
} from './pages/admin';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminSetup from './pages/admin/AdminSetup';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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



const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <SkeletonLoader />
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/user/dashboard" replace /> : children;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/security-verification" element={<PublicRoute><SecurityVerification /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/logout" element={<Logout />} />
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersManagement />} />
            <Route path="orders" element={<AdminOrdersManagement />} />
            <Route path="products" element={<AdminProductManagement />} />
            <Route path="deposits" element={<AdminDeposits />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="emailer" element={<AdminEmailer />} />
            <Route path="blog" element={<AdminBlogManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          <Route path="/user" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="team" element={<Team />} />
            <Route path="team-tree" element={<TeamTree />} />
            <Route path="incentives" element={<Incentives />} />
            <Route path="rankings-earnings" element={<RankingsEarnings />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          {/* <SettingsProvider> */}
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          {/* </SettingsProvider> */}
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;