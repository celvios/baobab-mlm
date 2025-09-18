import React, { useState, useEffect } from 'react';
import { BellIcon, ChevronDownIcon, EyeIcon, PencilIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import UserDetailModal from '../../components/UserDetailModal';
// Using fetch API instead of axios

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function UsersManagement() {
  const [sortBy, setSortBy] = useState('All Users');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    onboardedUsers: 0,
    pendingUsers: 0
  });

  // Removed mock users - using real API data only

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.users) {
        setUsers(data.users);
      } else {
        console.error('API Error:', data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.stats) {
        setStats({
          totalUsers: data.stats?.totalUsers || 0,
          onboardedUsers: data.stats?.onboardedUsers || 0,
          pendingUsers: data.stats?.pendingUsers || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

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
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-gray-500 text-sm">{stats.totalUsers.toLocaleString()} All Users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-600 text-sm mb-2">Onboarded Users</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.onboardedUsers}</div>
            <p className="text-gray-500 text-sm">{stats.onboardedUsers} Onboarded Users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-600 text-sm mb-2">Pending Users</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.pendingUsers}</div>
            <p className="text-gray-500 text-sm">{stats.pendingUsers} Pending Users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm mb-2">New User & Payments</h3>
                <div className="text-green-600 font-medium">Active</div>
              </div>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <UserPlusIcon className="h-4 w-4 text-white" />
              </button>
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
                            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm text-gray-900">{user.full_name || user.email}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.is_active ? 'Active' : 'Inactive'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.stage || user.current_stage || 'Feeder'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{(user.total_orders || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        View
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

      {/* User Detail Modal */}
      <UserDetailModal 
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
      />

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stage</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Feeder</option>
                  <option>Bronze</option>
                  <option>Silver</option>
                  <option>Gold</option>
                  <option>Diamond</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}