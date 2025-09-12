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
    };
    
    validateAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiService.login(email, password);
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
    
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
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    localStorage.removeItem('user');
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