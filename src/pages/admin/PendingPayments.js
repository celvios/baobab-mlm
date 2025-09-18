import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import Toast from '../../components/Toast';

export default function PendingPayments() {
  const [depositRequests, setDepositRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    fetchDepositRequests();
  }, []);

  const fetchDepositRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/deposit-requests`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setDepositRequests(data.depositRequests || []);
      }
    } catch (error) {
      console.error('Failed to fetch deposit requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeposit = async (requestId, userId, amount) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/approve-deposit`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, userId, amount })
      });
      
      if (response.ok) {
        setToastMessage('Deposit approved successfully!');
        setShowToast(true);
        fetchDepositRequests();
      } else {
        throw new Error('Failed to approve deposit');
      }
    } catch (error) {
      setToastMessage('Failed to approve deposit');
      setShowToast(true);
    }
  };

  const viewProof = (proofUrl) => {
    setSelectedProof(proofUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Deposit Requests</h1>
        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          {depositRequests.length} Pending
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proof</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {depositRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.full_name}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                      <div className="text-xs text-blue-600 font-medium">
                        Wallet Deposit Request
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₦{request.amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {request.proof_url && (
                      <button
                        onClick={() => viewProof(request.proof_url)}
                        className="text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleApproveDeposit(request.id, request.user_id, request.amount)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {depositRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No deposit requests</p>
          </div>
        )}
      </div>

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Deposit Proof</h3>
              <button
                onClick={() => setSelectedProof(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedProof}
                alt="Deposit Proof"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        type={toastMessage.includes('successfully') ? 'success' : 'error'}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}