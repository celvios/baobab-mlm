import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function CashoutRequests() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/withdrawals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.withdrawals);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/withdrawals/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateWithdrawalStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/withdrawals/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchWithdrawals();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update withdrawal status:', error);
    }
  };

  const [dummyRequests] = useState([
    { id: 1, user: 'John Doe', email: 'john@email.com', amount: 45000, stage: 'Bronze', date: '01/01/25', status: 'Pending', repurchase: 'Required' },
    { id: 2, user: 'Jane Smith', email: 'jane@email.com', amount: 72000, stage: 'Silver', date: '01/01/25', status: 'Approved', repurchase: 'Completed' },
    { id: 3, user: 'Mike Johnson', email: 'mike@email.com', amount: 18000, stage: 'Feeder', date: '31/12/24', status: 'Processing', repurchase: 'Completed' },
    { id: 4, user: 'Sarah Wilson', email: 'sarah@email.com', amount: 288000, stage: 'Gold', date: '31/12/24', status: 'Pending', repurchase: 'Required' }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRepurchaseColor = (repurchase) => {
    switch (repurchase) {
      case 'Required': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Cashout Requests</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Cashout Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Review and process member withdrawal requests.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Pending Requests</h3>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">{stats.pendingRequests || 0}</div>
              <p className="text-gray-500 text-xs sm:text-sm">Awaiting Review</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Amount</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">₦{stats.totalPendingAmount?.toLocaleString() || '0'}</div>
              <p className="text-gray-500 text-sm">Pending Payouts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Processed Today</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">₦{stats.todayProcessed?.toLocaleString() || '0'}</div>
              <p className="text-gray-500 text-sm">{stats.todayCount || 0} Requests</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Processed</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalProcessed || 0}</div>
              <p className="text-gray-500 text-sm">All Time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Withdrawal Requests</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto">
                  Bulk Approve
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto">
                  Export Report
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input 
                type="text" 
                placeholder="Search requests..." 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <select className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Processing</option>
                <option>Rejected</option>
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto">
                <option>All Stages</option>
                <option>Feeder</option>
                <option>Bronze</option>
                <option>Silver</option>
                <option>Gold</option>
                <option>Diamond</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repurchase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(requests.length > 0 ? requests : dummyRequests).map((request, index) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.user_name || request.user}</div>
                        <div className="text-sm text-gray-500">{request.user_email || request.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">₦{(request.amount || request.withdrawal_amount)?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {request.user_stage || request.stage || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{request.created_at ? new Date(request.created_at).toLocaleDateString() : request.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${getRepurchaseColor(request.repurchase)}`}>
                        {request.repurchase_status || request.repurchase || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                        {(request.withdrawal_status || request.status) === 'pending' ? 'Pending' :
                         (request.withdrawal_status || request.status) === 'approved' ? 'Approved' :
                         (request.withdrawal_status || request.status) === 'completed' ? 'Completed' :
                         (request.withdrawal_status || request.status) === 'rejected' ? 'Rejected' :
                         request.withdrawal_status || request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800" title="View Details">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {(request.withdrawal_status || request.status) === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateWithdrawalStatus(request.id, 'approved')}
                              className="text-green-600 hover:text-green-800" 
                              title="Approve"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => updateWithdrawalStatus(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-800" 
                              title="Reject"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {(request.withdrawal_status || request.status) === 'approved' && (
                          <button 
                            onClick={() => updateWithdrawalStatus(request.id, 'completed')}
                            className="text-yellow-600 hover:text-yellow-800" 
                            title="Mark as Processed"
                          >
                            <ClockIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}