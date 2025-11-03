import React, { useState, useEffect } from 'react';
import { useDashboardAccess } from '../hooks/useDashboardAccess';
import DashboardLock from '../components/DashboardLock';
import DepositModal from '../components/DepositModal';
import apiService from '../services/api';

export default function DashboardWrapper({ children }) {
  const { dashboardLocked, loading } = useDashboardAccess();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStatus, setDepositStatus] = useState('Not Submitted');
  const [hasDeposit, setHasDeposit] = useState(false);

  useEffect(() => {
    if (dashboardLocked) {
      fetchDepositStatus();
    }
  }, [dashboardLocked]);

  const fetchDepositStatus = async () => {
    try {
      const response = await apiService.getDepositStatus();
      setDepositStatus(response.depositStatus || 'Not Submitted');
      setHasDeposit(response.hasDeposit || false);
    } catch (error) {
      console.error('Error fetching deposit status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-4xl">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardLocked) {
    return (
      <>
        <DashboardLock 
          onDepositClick={() => setShowDepositModal(true)} 
          depositStatus={depositStatus}
          hasDeposit={hasDeposit}
        />
        <DepositModal 
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            fetchDepositStatus();
            setTimeout(() => window.location.reload(), 2000);
          }}
        />
      </>
    );
  }

  return children;
}
