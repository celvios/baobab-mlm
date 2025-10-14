import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useDashboardAccess = () => {
  const [dashboardLocked, setDashboardLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const response = await apiService.get('/deposit/status');
      setDashboardLocked(!response.dashboardUnlocked);
    } catch (error) {
      console.error('Error checking dashboard access:', error);
      setDashboardLocked(false);
    } finally {
      setLoading(false);
    }
  };

  return { dashboardLocked, loading, recheckAccess: checkAccess };
};
