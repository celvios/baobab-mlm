import React, { useState } from 'react';
import { CheckIcon, XMarkIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function CashoutRequests() {
  const [requests] = useState([
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

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cashout Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Review and process member withdrawal requests.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Pending Requests</h3>
              <div className="text-3xl font-bold text-yellow-600 mb-2">23</div>
              <p className="text-gray-500 text-sm">Awaiting Review</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Amount</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">₦2.1M</div>
              <p className="text-gray-500 text-sm">Pending Payouts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Processed Today</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">₦890K</div>
              <p className="text-gray-500 text-sm">12 Requests</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Repurchase Required</h3>
              <div className="text-3xl font-bold text-red-600 mb-2">8</div>
              <p className="text-gray-500 text-sm">Blocked Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Withdrawal Requests</h3>
              <div className="flex space-x-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                  Bulk Approve
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  Export Report
                </button>
              </div>
            </div>
            <div className="flex space-x-4">
              <input 
                type="text" 
                placeholder="Search requests..." 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Processing</option>
                <option>Rejected</option>
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm">
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
                {requests.map((request, index) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.user}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">₦{request.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {request.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{request.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${getRepurchaseColor(request.repurchase)}`}>
                        {request.repurchase}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800" title="View Details">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {request.status === 'Pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-800" title="Approve">
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800" title="Reject">
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {request.status === 'Approved' && (
                          <button className="text-yellow-600 hover:text-yellow-800" title="Processing">
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