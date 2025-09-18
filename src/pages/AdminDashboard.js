import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Orders</h3>
          <p className="text-2xl font-bold">56</p>
        </div>
        <Link to="/admin/deposit-requests" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Deposit Requests</h3>
          <p className="text-2xl font-bold text-blue-600">8</p>
          <p className="text-xs text-gray-400 mt-1">Click to manage</p>
        </Link>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Withdrawals</h3>
          <p className="text-2xl font-bold">23</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/deposit-requests" className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">
            <h3 className="font-medium">Manage Deposit Requests</h3>
            <p className="text-sm opacity-90">Review and approve deposits</p>
          </Link>
          <Link to="/admin/users" className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors">
            <h3 className="font-medium">User Management</h3>
            <p className="text-sm opacity-90">Manage user accounts</p>
          </Link>
          <Link to="/admin/cashout" className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
            <h3 className="font-medium">Cashout Requests</h3>
            <p className="text-sm opacity-90">Process withdrawals</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;