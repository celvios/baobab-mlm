import React, { useState, useEffect } from 'react';
import { SpeakerWaveIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';
import DeleteHistoryModal from '../components/DeleteHistoryModal';
import Toast from '../components/Toast';
import SkeletonLoader from '../components/SkeletonLoader';
import apiService from '../services/api';



export default function History() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteAll, setIsDeleteAll] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profile, transactions] = await Promise.all([
        apiService.getProfile(),
        apiService.getTransactionHistory()
      ]);
      setUserProfile(profile);
      
      // Get real order and transaction data
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const withdrawals = JSON.parse(localStorage.getItem('userWithdrawals') || '[]');
      
      const historyData = [
        ...userOrders.map((order, index) => ({
          id: index + 1,
          account: profile?.email || 'user@example.com',
          stage: profile?.mlmLevel === 'feeder' ? 'Feeder' : profile?.mlmLevel?.charAt(0).toUpperCase() + profile?.mlmLevel?.slice(1) || 'No Level',
          transaction: 'Product Order',
          type: 'Outgoing',
          amount: `$${order.amount.toLocaleString()}`,
          amountValue: order.amount,
          status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending',
          originalId: order.id
        })),
        ...withdrawals.map((withdrawal, index) => ({
          id: userOrders.length + index + 1,
          account: profile?.email || 'user@example.com',
          stage: profile?.mlmLevel === 'feeder' ? 'Feeder' : profile?.mlmLevel?.charAt(0).toUpperCase() + profile?.mlmLevel?.slice(1) || 'No Level',
          transaction: 'Withdrawal',
          type: 'Outgoing',
          amount: `$${withdrawal.amount.toLocaleString()}`,
          amountValue: withdrawal.amount,
          status: withdrawal.status?.charAt(0).toUpperCase() + withdrawal.status?.slice(1) || 'Pending',
          originalId: withdrawal.id
        })),
        ...transactions.transactions?.map((tx, index) => ({
          id: userOrders.length + withdrawals.length + index + 1,
          account: profile?.email || 'user@example.com',
          stage: profile?.mlmLevel === 'feeder' ? 'Feeder' : profile?.mlmLevel?.charAt(0).toUpperCase() + profile?.mlmLevel?.slice(1) || 'No Level',
          transaction: tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1) || 'Transaction',
          type: tx.amount > 0 ? 'Incoming' : 'Outgoing',
          amount: `$${Math.abs(tx.amount).toLocaleString()}`,
          amountValue: Math.abs(tx.amount),
          status: tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1) || 'Pending',
          originalId: tx.id
        })) || []
      ];
      
      setHistoryData(historyData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to localStorage data only
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const withdrawals = JSON.parse(localStorage.getItem('userWithdrawals') || '[]');
      
      const fallbackData = [
        ...userOrders.map((order, index) => ({
          id: index + 1,
          account: 'user@example.com',
          stage: 'No Level',
          transaction: 'Product Order',
          type: 'Outgoing',
          amount: `$${order.amount.toLocaleString()}`,
          amountValue: order.amount,
          status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending',
          originalId: order.id
        })),
        ...withdrawals.map((withdrawal, index) => ({
          id: userOrders.length + index + 1,
          account: 'user@example.com',
          stage: 'No Level',
          transaction: 'Withdrawal',
          type: 'Outgoing',
          amount: `$${withdrawal.amount.toLocaleString()}`,
          amountValue: withdrawal.amount,
          status: withdrawal.status?.charAt(0).toUpperCase() + withdrawal.status?.slice(1) || 'Pending',
          originalId: withdrawal.id
        }))
      ];
      
      setHistoryData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const getSortedHistoryData = () => {
    return [...historyData].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amountValue || 0;
          bValue = b.amountValue || 0;
          break;
        case 'transaction':
          aValue = a.transaction.toLowerCase();
          bValue = b.transaction.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        default: // 'id'
          aValue = a.id;
          bValue = b.id;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  if (loading) {
    return <SkeletonLoader />;
  }



  return (
    <div className="space-y-6">
      {/* Market Updates */}
      <div className="bg-black text-white p-3 rounded-lg flex items-center">
        <SpeakerWaveIcon className="h-5 w-5 mr-3" />
        <div className="overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {(() => {
              const marketUpdates = JSON.parse(localStorage.getItem('marketUpdates') || '[]');
              const messages = marketUpdates.length > 0 
                ? marketUpdates.slice(0, 3).map(update => update.message)
                : ['Welcome to Baobab Community! Check your dashboard for updates'];
              return messages.map((msg, i) => <span key={i} className="mr-8">Updates: {msg}</span>);
            })()}
          </div>
        </div>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">History</h1>
        <div className="flex items-center space-x-2 lg:space-x-3">
          <button 
            onClick={() => {
              setIsDeleteAll(true);
              setShowDeleteModal(true);
            }}
            className="bg-black text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Delete All
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="border border-gray-300 text-gray-700 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
            >
              Sort By: {sortBy === 'id' ? 'Date' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              <ChevronDownIcon className="h-3 w-3 lg:h-4 lg:w-4 ml-1 lg:ml-2" />
            </button>
            
            {showSortDropdown && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[150px]">
                {[
                  { value: 'id', label: 'Date' },
                  { value: 'amount', label: 'Amount' },
                  { value: 'transaction', label: 'Transaction' },
                  { value: 'status', label: 'Status' },
                  { value: 'type', label: 'Type' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      sortBy === option.value ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="ml-2 text-xs"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">#</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Account</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm hidden sm:table-cell">Stage</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Transaction</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm hidden md:table-cell">Type</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Amount</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Status</th>
                <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {getSortedHistoryData().length > 0 ? getSortedHistoryData().map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 lg:py-4 px-2 lg:px-4 text-xs lg:text-sm">{item.id}</td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4">
                    <div className="flex items-center">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xs mr-1 lg:mr-2">
                        {userProfile?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs lg:text-sm truncate">{userProfile?.email}</span>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4 hidden sm:table-cell">
                    <div className="flex items-center">
                      <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gray-600 rounded-full flex items-center justify-center mr-1 lg:mr-2">
                        <img src="/images/leaf-1.png" alt="Level" className="w-2 h-2 lg:w-3 lg:h-3" />
                      </div>
                      <span className="text-xs lg:text-sm">{userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'Feeder'}</span>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4 text-xs lg:text-sm">{item.transaction}</td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4 text-xs lg:text-sm hidden md:table-cell">{item.type}</td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4 text-xs lg:text-sm font-semibold">{item.amount}</td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4">
                    <span className={`px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Approved' || item.status === 'Successful'
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 lg:py-4 px-2 lg:px-4">
                    <button 
                      onClick={() => {
                        setSelectedItem(item);
                        setIsDeleteAll(false);
                        setShowDeleteModal(true);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="py-8 px-4 text-center text-gray-500">
                    No transaction history available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteHistoryModal 
        isOpen={showDeleteModal}
        isDeleteAll={isDeleteAll}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
          setIsDeleteAll(false);
        }}
        onConfirm={() => {
          if (isDeleteAll) {
            // Clear all localStorage data
            localStorage.setItem('userOrders', JSON.stringify([]));
            localStorage.setItem('userWithdrawals', JSON.stringify([]));
            setHistoryData([]);
            setToastMessage('All records deleted successfully!');
          } else {
            // Remove specific item from localStorage
            const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            const userWithdrawals = JSON.parse(localStorage.getItem('userWithdrawals') || '[]');
            
            if (selectedItem.transaction === 'Product Order') {
              const updatedOrders = userOrders.filter(order => order.id !== selectedItem.originalId);
              localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
            } else if (selectedItem.transaction === 'Withdrawal') {
              const updatedWithdrawals = userWithdrawals.filter(withdrawal => withdrawal.id !== selectedItem.originalId);
              localStorage.setItem('userWithdrawals', JSON.stringify(updatedWithdrawals));
            }
            
            setHistoryData(prev => prev.filter(item => item.id !== selectedItem.id));
            setToastMessage('Record deleted successfully!');
          }
          setShowDeleteModal(false);
          setSelectedItem(null);
          setIsDeleteAll(false);
          setShowToast(true);
        }}
      />

      <Toast 
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}