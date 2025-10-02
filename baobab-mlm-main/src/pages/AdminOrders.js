import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    setOrders(userOrders.reverse());
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const updatedOrders = userOrders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, paymentStatus: newStatus === 'approved' ? 'approved' : order.paymentStatus }
        : order
    );
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
    loadOrders();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin - Order Management</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.product} (x{order.quantity})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦{order.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {order.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'approved')}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'rejected')}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <XCircleIcon className="h-5 w-5 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                  {order.status !== 'pending' && (
                    <span className="text-gray-500">
                      {order.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}