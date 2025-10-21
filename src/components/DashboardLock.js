import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function DashboardLock({ onDepositClick, depositStatus = 'Not Submitted', hasDeposit = false }) {
  const getStatusColor = () => {
    if (depositStatus === 'Submitted') return 'bg-yellow-100 text-yellow-800';
    if (depositStatus === 'Approved') return 'bg-green-100 text-green-800';
    if (depositStatus === 'Rejected') return 'bg-red-100 text-red-800';
    return 'text-gray-900';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <LockClosedIcon className="w-10 h-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Dashboard Locked
        </h2>
        
        <p className="text-gray-600 mb-2">
          Welcome to Baobab MLM!
        </p>
        
        <p className="text-gray-700 font-medium mb-6">
          To unlock all features, please deposit a minimum of <span className="text-green-600 font-bold">₦18,000</span>
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Current Status:</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
              No Stage
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Deposit Status:</span>
            <span className={`text-sm font-medium ${depositStatus === 'Submitted' || depositStatus === 'Approved' || depositStatus === 'Rejected' ? `px-2 py-1 rounded-full text-xs ${getStatusColor()}` : 'text-gray-900'}`}>
              {depositStatus}
            </span>
          </div>
        </div>
        
        {!hasDeposit ? (
          <button
            onClick={onDepositClick}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Make Deposit
          </button>
        ) : depositStatus === 'Submitted' ? (
          <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 py-3 px-6 rounded-lg font-medium">
            Deposit Submitted - Awaiting Approval
          </div>
        ) : depositStatus === 'Rejected' ? (
          <button
            onClick={onDepositClick}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Resubmit Deposit
          </button>
        ) : null}
        
        <p className="text-xs text-gray-500 mt-4">
          {depositStatus === 'Submitted' 
            ? 'Your deposit is being reviewed by our admin team'
            : 'After deposit approval, you\'ll gain access to all dashboard features'}
        </p>
      </div>
    </div>
  );
}
