import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    businessName: 'Baobab MLM Business',
    businessEmail: 'admin@baobabmlm.com',
    businessPhone: '+234-XXX-XXX-XXXX',
    businessAddress: 'Lagos, Nigeria',
    bankName: 'Not configured',
    accountNumber: 'Not configured',
    accountName: 'Not configured',
    loading: true
  });

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const apiUrl = baseUrl.endsWith('/api') ? `${baseUrl}/settings` : `${baseUrl}/api/settings`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings({
            businessName: data.settings.business_name || 'Baobab MLM Business',
            businessEmail: data.settings.business_email || 'admin@baobabmlm.com',
            businessPhone: data.settings.business_phone || '+234-XXX-XXX-XXXX',
            businessAddress: data.settings.business_address || 'Lagos, Nigeria',
            bankName: data.settings.bank_name || 'Not configured',
            accountNumber: data.settings.account_number || 'Not configured',
            accountName: data.settings.account_name || 'Not configured',
            loading: false
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettings(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    // Temporarily disable settings fetch to avoid 404 errors
    // fetchSettings();
    setSettings(prev => ({ ...prev, loading: false }));
  }, []);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};