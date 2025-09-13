import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function UsersManagement() {
  const [sortBy, setSortBy] = useState('All Users');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const users = [
    {
      id: 1,
      email: 'reg@gmail.com',
      status: 'Onboarded Users',
      stage: 'Feeder',
      date: '24',
      amount: '#13,500',
      action: 'View'
    },
    {
      id: 2,
      email: 'reg@gmail.com',
      status: 'Onboarded Users',
      stage: 'Feeder',
      date: '24',
      amount: '#13,500',
      action: 'View'
    },
    {
      id: 3,
      email: 'reg@gmail.com',
      status: 'Onboarded Users',
      stage: 'Feeder',
      date: '24',
      amount: '#13,500',
      action: 'View'
    },
    {
      id: 4,
      email: 'reg@gmail.com',
      status: 'Onboarded Users',
      stage: 'Feeder',
      date: '24',
      amount: '#13,500',
      action: 'View'
    },
    {
      id: 5,
      email: 'reg@gmail.com',
      status: 'Onboarded Users',
      stage: 'Feeder',
      date: '24',
      amount: '#13,500',
      action: 'View'
    },
    {
      id: 6,
      email: 'reg@gmail.com',
      status: 'Onboarded Users',
      stage: 'Feeder',
      date: '24',
      amount: '#13,500',
      action: 'View'
    }
  ];

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
          <div className="relative">
            <BellIcon className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Page Description */}
        <p className="text-gray-600 text-sm mb-6">View and manage all users without effort.</p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-600 text-sm mb-2">Total Users</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">208,768</div>
            <p className="text-gray-500 text-sm">208,768 All Users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-600 text-sm mb-2">Onboarded Users</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">152</div>
            <p className="text-gray-500 text-sm">152 Onboarded Users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-600 text-sm mb-2">Pending Users</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">48</div>
            <p className="text-gray-500 text-sm">48 Pending Users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm mb-2">New User & Payments</h3>
                <div className="text-green-600 font-medium">Active</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option>All Users</option>
                    <option>Onboarded Users</option>
                    <option>Pending Users</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Reg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Amt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-yellow-600 text-xs font-semibold">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.status}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.amount}</td>
                    <td className="px-6 py-4">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        {user.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing 1 to 6 of 208,768 results
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}