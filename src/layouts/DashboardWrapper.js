import React, { useState } from 'react';
import { useDashboardAccess } from '../hooks/useDashboardAccess';
import DashboardLock from '../components/DashboardLock';
import DepositModal from '../components/DepositModal';

export default function DashboardWrapper({ children }) {
  const { dashboardLocked, loading } = useDashboardAccess();
  const [showDepositModal, setShowDepositModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (dashboardLocked) {
    return (
      <>
        <DashboardLock onDepositClick={() => setShowDepositModal(true)} />
        <DepositModal 
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => window.location.reload()}
        />
      </>
    );
  }

  return children;
}
