import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './components/NotificationSystem';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './contexts/CartContext';
// import { SettingsProvider } from './contexts/SettingsContext';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardLayout from './layouts/DashboardLayout';
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
          <Route path="/logout" element={<Logout />} />
          
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