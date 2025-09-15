import React, { useState } from 'react';
import { XMarkIcon, UserIcon, BanknotesIcon, ShoppingBagIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function UserDetailModal({ user, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('details');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  if (!isOpen || !user) return null;

  const mockUserData = {
    id: user.id,
    name: 'John Doe',
    email: user.email || 'john@email.com',
    phone: '+2348012345678',
    address: 'Lagos, Nigeria',
    stage: user.stage || 'Feeder',
    dateRegistered: '24/12/2024',
    status: 'Active',
    totalEarnings: 45000,
    totalOrders: 12,
    referrals: 8,
    bankDetails: {
      bankName: 'First Bank',
      accountNumber: '1234567890',
      accountName: 'John Doe'
    },
    orders: [
      { id: 1, product: 'Lentoc Tea', amount: 13500, date: '01/01/25', status: 'Delivered' },
      { id: 2, product: 'Face Cream', amount: 18000, date: '31/12/24', status: 'Pending' }
    ],
    transactions: [
      { id: 1, type: 'Earning', amount: 4500, date: '01/01/25', description: 'Referral Bonus' },
      { id: 2, type: 'Withdrawal', amount: -15000, date: '30/12/24', description: 'Bank Transfer' }
    ],
    teamMembers: [
      { id: 1, name: 'Jane Smith', stage: 'Bronze', earnings: 18000 },
      { id: 2, name: 'Mike Johnson', stage: 'Feeder', earnings: 4500 }
    ]
  };

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
                <h2 className="text-xl font-semibold text-gray-900">{mockUserData.name}</h2>
                <p className="text-sm text-gray-500">{mockUserData.email}</p>
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
                        <p className="text-sm text-gray-900">{mockUserData.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{mockUserData.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900">{mockUserData.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm text-gray-900">{mockUserData.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">MLM Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Stage</label>
                        <p className="text-sm text-gray-900">{mockUserData.stage}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date Registered</label>
                        <p className="text-sm text-gray-900">{mockUserData.dateRegistered}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {mockUserData.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Earnings</label>
                        <p className="text-sm font-semibold text-green-600">${mockUserData.totalEarnings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bank Name</label>
                      <p className="text-sm text-gray-900">{mockUserData.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <p className="text-sm text-gray-900">{mockUserData.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Name</label>
                      <p className="text-sm text-gray-900">{mockUserData.bankDetails.accountName}</p>
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
                      {mockUserData.orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 text-sm">{order.product}</td>
                          <td className="px-4 py-3 text-sm font-medium">${order.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{order.date}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                <div className="space-y-3">
                  {mockUserData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
                <div className="space-y-3">
                  {mockUserData.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">Stage: {member.stage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">${member.earnings.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Total Earnings</p>
                      </div>
                    </div>
                  ))}
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