import { useState, useEffect, createContext, useContext } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          apiService.setToken(token);
          await apiService.getProfile();
          setUser(JSON.parse(userData));
        } catch (error) {
          // Token is invalid, clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          apiService.setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
      setInitialLoad(false);
    };
    
    validateAuth();
  }, []);

  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      
      // Fetch full profile to get country and other details
      const profile = await apiService.getProfile();
      const fullUser = { ...response.user, ...profile };
      
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      
      // Add welcome message to market updates
      const existingUpdates = JSON.parse(localStorage.getItem('marketUpdates') || '[]');
      const welcomeUpdate = {
        id: Date.now(),
        title: 'Welcome back!',
        message: `Hello ${response.user.fullName}, welcome back to Baobab! Ready to grow your business today?`,
        type: 'success',
        date: new Date().toISOString(),
        isRead: false
      };
      existingUpdates.unshift(welcomeUpdate);
      localStorage.setItem('marketUpdates', JSON.stringify(existingUpdates));
      
      return response;
    } catch (error) {
      // If verification required, store email for OTP verification
      if (error.message.includes('verify your email')) {
        localStorage.setItem('pendingVerificationEmail', email);
      }
      throw error;
    }
  };

  const logout = (navigate) => {
    apiService.logout();
    setUser(null);
    localStorage.removeItem('user');
    if (navigate) {
      navigate('/logout', { replace: true });
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};