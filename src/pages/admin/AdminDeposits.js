import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCheck, FiX, FiEye, FiSearch } from 'react-icons/fi';
import apiService from '../../services/api';

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      console.log('Fetching deposits...');
      const response = await apiService.getDepositRequests();
      console.log('Deposits response:', response);
      setDeposits(response.deposits || []);
      
      // Calculate stats
      const total = response.deposits?.length || 0;
      const pending = response.deposits?.filter(d => d.status === 'pending').length || 0;
      const approved = response.deposits?.filter(d => d.status === 'approved').length || 0;
      const rejected = response.deposits?.filter(d => d.status === 'rejected').length || 0;
      
      setStats({ total, pending, approved, rejected });
      console.log('Stats:', { total, pending, approved, rejected });
    } catch (error) {
      console.error('Error fetching deposits:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (depositId, amount) => {
    if (window.confirm('Approve this deposit request?')) {
      try {
        await apiService.approveDeposit(depositId, { amount });
        alert('Deposit approved and user credited successfully!');
        fetchDeposits();
      } catch (error) {
        console.error('Error approving deposit:', error);
        alert('Failed to approve deposit: ' + error.message);
      }
    }
  };

  const handleReject = async (depositId) => {
    if (window.confirm('Reject this deposit request?')) {
      try {
        await apiService.rejectDeposit(depositId);
        alert('Deposit rejected successfully!');
        fetchDeposits();
      } catch (error) {
        console.error('Error rejecting deposit:', error);
        alert('Failed to reject deposit: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deposit Requests</h1>
        <p className="text-gray-600">Manage user deposit requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiX className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Deposit Requests</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deposits.length > 0 ? deposits
                .filter(deposit => {
                  // Status filter
                  if (statusFilter !== 'all' && deposit.status !== statusFilter) return false;
                  
                  // Search filter
                  if (searchTerm) {
                    const search = searchTerm.toLowerCase();
                    return (
                      deposit.user_name?.toLowerCase().includes(search) ||
                      deposit.user_email?.toLowerCase().includes(search)
                    );
                  }
                  
                  return true;
                })
                .map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-medium">
                          {deposit.user_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{deposit.user_name}</div>
                        <div className="text-sm text-gray-500">{deposit.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₦{deposit.amount?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{deposit.payment_method || 'Bank Transfer'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(deposit.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      deposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                      deposit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deposit.status?.charAt(0).toUpperCase() + deposit.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setSelectedDeposit(deposit); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FiEye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      {deposit.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(deposit.id, deposit.amount)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <FiCheck className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(deposit.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <FiX className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No deposit requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Details Modal */}
      {showModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Deposit Request Details</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User Name</label>
                  <p className="text-base font-medium text-gray-900">{selectedDeposit.user_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-base text-gray-900">{selectedDeposit.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-base font-semibold text-gray-900">₦{selectedDeposit.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-base text-gray-900">{selectedDeposit.payment_method || 'Bank Transfer'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-base text-gray-900">{new Date(selectedDeposit.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedDeposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedDeposit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedDeposit.status?.charAt(0).toUpperCase() + selectedDeposit.status?.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Payment Proof</label>
                {selectedDeposit.payment_proof ? (
                  <div className="relative">
                    <img 
                      src={selectedDeposit.payment_proof} 
                      alt="Payment Proof" 
                      className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error('Image load error:', selectedDeposit.payment_proof?.substring(0, 50));
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No payment proof uploaded</p>
                )}
              </div>
            </div>

            {selectedDeposit.status === 'pending' && (
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => { handleReject(selectedDeposit.id); setShowModal(false); }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => { handleApprove(selectedDeposit.id, selectedDeposit.amount); setShowModal(false); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <FiCheck className="w-4 h-4 mr-2" />
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeposits;