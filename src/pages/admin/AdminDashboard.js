import React, { useState, useEffect } from 'react';
import { BellIcon, PencilIcon } from '@heroicons/react/24/outline';
import ProcessLoader from '../../components/ProcessLoader';
import { LineChart, BarChart } from '../../components/SimpleChart';
import { useSettings } from '../../contexts/SettingsContext';
import AdminStats from '../../components/admin/AdminStats';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDashboardData(data);
      } else {
        setDashboardData({
          stats: {
            totalUsers: 0,
            totalOrders: 0,
            totalSales: 0,
            totalRevenue: 0,
            totalProducts: 0,
            todayEarnings: 0,
            totalWalletBalance: 0,
            totalMlmEarnings: 0,
            pendingWithdrawals: 0,
            totalWithdrawalAmount: 0,
            pendingDeposits: 0
          },
          salesDynamics: [],
          userGrowth: [],
          recentOrders: [],
          mlmBreakdown: [],
          recentWithdrawals: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData({
        stats: {
          totalUsers: 0,
          totalOrders: 0,
          totalSales: 0,
          totalRevenue: 0,
          totalProducts: 0,
          todayEarnings: 0,
          totalWalletBalance: 0,
          totalMlmEarnings: 0,
          pendingWithdrawals: 0,
          totalWithdrawalAmount: 0,
          pendingDeposits: 0
        },
        salesDynamics: [],
        userGrowth: [],
        recentOrders: [],
        mlmBreakdown: [],
        recentWithdrawals: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ProcessLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="relative">
            <BellIcon className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Access critical metrics with a clear, real-time view of your platform's performance.</p>
          
          <AdminStats stats={{
            totalUsers: dashboardData?.stats?.totalUsers,
            activeOrders: dashboardData?.stats?.totalOrders,
            pendingPayments: dashboardData?.stats?.pendingPayments,
            pendingWithdrawals: dashboardData?.stats?.pendingWithdrawals
          }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Sales Dynamics (Last 7 Days)</h3>
              <div className="h-64">
                <LineChart 
                  data={dashboardData?.salesDynamics?.map(item => ({
                    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: parseFloat(item.daily_sales || 0)
                  })) || []} 
                  color="#10b981"
                />
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">#</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Order No.</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Product</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recentOrders?.length > 0 ? (
                      dashboardData.recentOrders.slice(0, 5).map((order, index) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="py-3 text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-sm text-gray-900 font-medium">
                            #{order.order_number}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {order.product_name}
                          </td>
                          <td className="py-3 text-sm text-gray-900 font-medium">
                            ${order.total_amount}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              order.delivery_status === 'delivered' 
                                ? 'bg-green-100 text-green-800'
                                : order.delivery_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {order.delivery_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-500">
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}