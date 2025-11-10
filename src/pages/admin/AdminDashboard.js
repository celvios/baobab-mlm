import React, { useState, useEffect } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiEye } from 'react-icons/fi';
import apiService from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    totalMLMEarnings: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getRecentActivity()
      ]);
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalOrders: statsData.totalOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
        pendingWithdrawals: statsData.pendingWithdrawals || 0,
        totalMLMEarnings: statsData.totalMlmEarnings || 0
      });
      setRecentActivity(activityData.activities || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingWithdrawals: 0,
        totalMLMEarnings: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="space-y-4 w-full">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your MLM system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={(stats.totalUsers || 0).toLocaleString()}
          color="bg-blue-500"
        />
        <StatCard
          icon={FiShoppingBag}
          title="Total Orders"
          value={(stats.totalOrders || 0).toLocaleString()}
          color="bg-green-500"
        />
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`₦${(stats.totalRevenue || 0).toLocaleString()}`}
          color="bg-purple-500"
        />
        <StatCard
          icon={FiDollarSign}
          title="MLM Earnings"
          value={`₦${(stats.totalMLMEarnings || 0).toLocaleString()}`}
          color="bg-emerald-500"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Pending Withdrawals"
          value={(stats.pendingWithdrawals || 0).toLocaleString()}
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