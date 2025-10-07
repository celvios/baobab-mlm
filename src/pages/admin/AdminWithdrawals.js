import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheck, FiX, FiEye } from 'react-icons/fi';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://baobab-mlm.onrender.com';
      const response = await fetch(`${API_URL}/api/admin/withdrawals`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      console.log('Withdrawals data:', data);
      setWithdrawals(data.requests || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const updateWithdrawalStatus = async (withdrawalId, status) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://baobab-mlm.onrender.com';
      const response = await fetch(`${API_URL}/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        alert(`Withdrawal ${status} successfully!`);
        fetchWithdrawals();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      alert('Failed to update withdrawal status');
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.bankDetails?.bankName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || withdrawal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cashout Requests</h1>
        <p className="text-gray-600">Manage withdrawal requests from users</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search withdrawals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {withdrawal.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{withdrawal.user?.fullName}</div>
                        <div className="text-sm text-gray-500">{withdrawal.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₦{withdrawal.amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      withdrawal.source === 'wallet' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {withdrawal.source === 'wallet' ? 'Wallet' : 'MLM Earnings'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{withdrawal.bankDetails?.bankName || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{withdrawal.bankDetails?.accountNumber || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{withdrawal.bankDetails?.accountName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {withdrawal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No cashout requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailsModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Withdrawal Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-medium">{selectedWithdrawal.user?.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedWithdrawal.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium text-lg">₦{selectedWithdrawal.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bank Details</p>
                  <p className="font-medium">{selectedWithdrawal.bankDetails?.bankName}</p>
                  <p className="text-sm">{selectedWithdrawal.bankDetails?.accountNumber}</p>
                  <p className="text-sm">{selectedWithdrawal.bankDetails?.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedWithdrawal.status)}`}>
                    {selectedWithdrawal.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-sm">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="mt-6 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;