import React, { useState } from 'react';
import { EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function OrdersManagement() {
  const [orders] = useState([
    { id: 1, date: '01/01/25', orderNo: 'Ord39hdre...', customer: 'John Doe', product: 'Lentoc Tea', qty: 1, amount: 13500, status: 'Pending' },
    { id: 2, date: '01/01/25', orderNo: 'Ord40kls...', customer: 'Jane Smith', product: 'Face Powder', qty: 2, amount: 12000, status: 'Processing' },
    { id: 3, date: '01/01/25', orderNo: 'Ord41mno...', customer: 'Mike Johnson', product: 'Lip Gloss', qty: 1, amount: 12000, status: 'Delivered' },
    { id: 4, date: '01/01/25', orderNo: 'Ord42pqr...', customer: 'Sarah Wilson', product: 'Organic Soap', qty: 3, amount: 18000, status: 'Shipped' }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Orders Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Track and manage all customer orders and deliveries.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Orders</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">1,247</div>
              <p className="text-gray-500 text-xs sm:text-sm">All Time Orders</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Pending Orders</h3>
              <div className="text-3xl font-bold text-yellow-600 mb-2">23</div>
              <p className="text-gray-500 text-sm">Awaiting Processing</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Today's Orders</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">45</div>
              <p className="text-gray-500 text-sm">Orders Today</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Revenue Today</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">#567,000</div>
              <p className="text-gray-500 text-sm">Today's Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto">
                Export Orders
              </button>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <select className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto">
                <option>All Status</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4 text-sm">{order.date}</td>
                    <td className="px-6 py-4 text-sm">{order.orderNo}</td>
                    <td className="px-6 py-4 text-sm font-medium">{order.customer}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-orange-600 text-xs">🍃</span>
                        </div>
                        <span className="text-sm">{order.product}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.qty}</td>
                    <td className="px-6 py-4 text-sm font-medium">#{order.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
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