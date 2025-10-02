import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, BanknotesIcon, ShoppingBagIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function UserDetailModal({ user, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('details');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserDetails();
    }
  }, [isOpen, user?.id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUserDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const userData = userDetails ? {
    id: userDetails.user.id,
    name: userDetails.user.full_name || 'N/A',
    email: userDetails.user.email,
    phone: userDetails.user.phone || 'N/A',
    address: userDetails.user.address || 'N/A',
    stage: userDetails.user.current_stage || 'Feeder',
    dateRegistered: new Date(userDetails.user.created_at).toLocaleDateString(),
    status: userDetails.user.is_active ? 'Active' : 'Inactive',
    totalEarnings: userDetails.user.total_earnings || 0,
    totalOrders: userDetails.orders?.length || 0,
    referrals: userDetails.teamMembers?.length || 0,
    bankDetails: {
      bankName: userDetails.user.bank_name || 'N/A',
      accountNumber: userDetails.user.account_number || 'N/A',
      accountName: userDetails.user.account_name || userDetails.user.full_name || 'N/A'
    },
    orders: userDetails.orders || [],
    transactions: userDetails.transactions || [],
    teamMembers: userDetails.teamMembers || []
  } : null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-center mt-4">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const tabs = [
    { id: 'details', name: 'User Details', icon: UserIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'transactions', name: 'Transactions', icon: BanknotesIcon },
    { id: 'team', name: 'Team Tree', icon: UsersIcon }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
                <p className="text-sm text-gray-500">{userData.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 text-sm font-medium border-b-2 flex items-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-sm text-gray-900">{userData.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{userData.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900">{userData.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm text-gray-900">{userData.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">MLM Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Stage</label>
                        <p className="text-sm text-gray-900 capitalize">{userData.stage}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date Registered</label>
                        <p className="text-sm text-gray-900">{userData.dateRegistered}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          userData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {userData.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Earnings</label>
                        <p className="text-sm font-semibold text-green-600">₦{userData.totalEarnings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bank Name</label>
                      <p className="text-sm text-gray-900">{userData.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <p className="text-sm text-gray-900">{userData.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Name</label>
                      <p className="text-sm text-gray-900">{userData.bankDetails.accountName}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userData.orders.length > 0 ? userData.orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 text-sm">{order.product_name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm font-medium">₦{(order.total_amount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                              order.delivery_status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.delivery_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.delivery_status || 'pending'}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                <div className="space-y-3">
                  {userData.transactions.length > 0 ? userData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{transaction.type || 'Transaction'}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{transaction.description || 'No description'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{transaction.status || 'completed'}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      No transactions found
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
                <div className="space-y-3">
                  {userData.teamMembers.length > 0 ? userData.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                          <p className="text-xs text-gray-500 capitalize">Stage: {member.current_stage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">₦{(member.total_earnings || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Total Earnings</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      No team members found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <button
              onClick={() => setShowDeactivateModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Deactivate User
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                Edit User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate User Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate User</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to deactivate this user? This action will suspend their account and prevent them from accessing the platform.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}