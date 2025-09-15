import React, { useState, useEffect } from 'react';
import { BellIcon, PencilIcon } from '@heroicons/react/24/outline';
import ProcessLoader from '../../components/ProcessLoader';
import { LineChart, BarChart } from '../../components/SimpleChart';
import { useSettings } from '../../contexts/SettingsContext';

// Use your live server API URL
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
      console.log('Fetching from:', `${API_BASE_URL}/admin/dashboard/stats`);
      console.log('Token:', token);
      
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        setDashboardData(data);
      } else {
        console.error('API Error:', data.message);
        setDashboardData({
          stats: {
            totalProducts: 0,
            totalSales: 0,
            totalUsers: 0,
            todayEarnings: 0
          },
          salesChart: [],
          earningsChart: [],
          recentOrders: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData({
        stats: {
          totalProducts: 0,
          totalSales: 0,
          totalUsers: 0,
          todayEarnings: 0
        },
        salesChart: [],
        earningsChart: [],
        recentOrders: []
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
      {/* Header */}
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
        {/* Dashboard Overview */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Access critical metrics with a clear, real-time view of your platform's performance.</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Available Products</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {dashboardData?.stats?.totalProducts || 0}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                {dashboardData?.stats?.totalProducts || 0} Available Products
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Sales</h3>
              <div className="text-2xl sm:text-3xl font-bold text-teal-600 mb-2">
                ${dashboardData?.stats?.totalSales?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                ${dashboardData?.stats?.totalSales?.toLocaleString() || '0'} Products Sales
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Users</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {dashboardData?.stats?.totalUsers?.toLocaleString() || 0}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                {dashboardData?.stats?.totalUsers?.toLocaleString() || 0} All Users
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Today Earnings</h3>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                ${dashboardData?.stats?.todayEarnings?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                ${dashboardData?.stats?.todayEarnings?.toLocaleString() || '0'} Earned Today
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Sales Dynamics Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Sales dynamics</h3>
              <div className="h-64">
                <LineChart 
                  data={dashboardData?.salesChart || []} 
                  color="#10b981"
                />
              </div>
              {dashboardData?.stats?.totalSales && (
                <div className="mt-2 text-sm text-gray-600">
                  Total Sales: ${dashboardData.stats.totalSales.toLocaleString()}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
                  All Orders
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">#</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Order No.</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Product</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Qty</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recentOrders?.length > 0 ? (
                      dashboardData.recentOrders.map((order, index) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-4 text-sm">{index + 1}</td>
                          <td className="py-4 text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-sm">{order.order_number}</td>
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-orange-600 text-xs">🍃</span>
                              </div>
                              <span className="text-sm">{order.product_name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-sm">1</td>
                          <td className="py-4 text-sm font-medium">
                            ${order.total_amount?.toLocaleString()}
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.order_status === 'pending' 
                                ? 'bg-orange-100 text-orange-600' 
                                : 'bg-green-100 text-green-600'
                            }`}>
                              {order.order_status === 'pending' ? 'Pending' : 'Delivered'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-500">
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Business Overview & Daily Earnings */}
          <div className="space-y-6 sm:space-y-8">
            {/* Business Overview */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Business Overview</h3>
              
              <div className="mb-4 sm:mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Wallet Balance</h4>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">
                  ${dashboardData?.stats?.totalRevenue?.toLocaleString() || dashboardData?.stats?.totalSales?.toLocaleString() || '0'}
                </div>
                <button className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base">
                  Cashout Requests
                </button>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Business Details</h4>
                  <PencilIcon className="h-4 w-4 text-gray-400" />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Business Name:</span>
                    <span className="ml-2 text-gray-900">{settings.businessName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">{settings.businessEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-900">{settings.businessPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <span className="ml-2 text-gray-900">{settings.businessAddress}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Bank Details</h4>
                  <PencilIcon className="h-4 w-4 text-gray-400" />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="ml-2 text-gray-900">{settings.bankName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Account Number:</span>
                    <span className="ml-2 text-gray-900">{settings.accountNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Earnings Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Daily Earnings</h3>
              <div className="h-40 sm:h-48">
                <BarChart 
                  data={dashboardData?.earningsChart || []} 
                  color="#10b981"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}