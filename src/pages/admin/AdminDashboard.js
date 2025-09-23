import React, { useState, useEffect } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiEye } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const baseURL = process.env.NODE_ENV === 'production' 
        ? 'https://baobab-backend.onrender.com'
        : 'http://localhost:5000';
      
      // Use the existing health endpoint to test connection
      const healthRes = await fetch(`${baseURL}/api/health`);
      
      if (healthRes.ok) {
        // For now, show sample data until backend is fully working
        setStats({
          totalUsers: 156,
          totalOrders: 89,
          totalRevenue: 2450000,
          pendingWithdrawals: 12
        });
        setRecentActivity([
          { description: 'New user registered: Sarah Johnson', created_at: new Date(Date.now() - 3600000).toISOString() },
          { description: 'Order completed: #ORD-2024-001', created_at: new Date(Date.now() - 7200000).toISOString() },
          { description: 'Withdrawal request: ₦75,000', created_at: new Date(Date.now() - 10800000).toISOString() },
          { description: 'New user registered: Michael Chen', created_at: new Date(Date.now() - 14400000).toISOString() }
        ]);
      } else {
        throw new Error('Backend not responding');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep stats at 0 if API fails
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingWithdrawals: 0
      });
      setRecentActivity([]);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your MLM system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          color="bg-blue-500"
        />
        <StatCard
          icon={FiShoppingBag}
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          color="bg-green-500"
        />
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`₦${stats.totalRevenue.toLocaleString()}`}
          color="bg-purple-500"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals.toLocaleString()}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <FiEye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;