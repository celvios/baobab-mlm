import React, { useState, useEffect } from 'react';
import { BellIcon, PencilIcon } from '@heroicons/react/24/outline';
import ProcessLoader from '../../components/ProcessLoader';
import { LineChart, BarChart } from '../../components/SimpleChart';
import { useSettings } from '../../contexts/SettingsContext';

// Use your live server API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('API Base URL:', API_BASE_URL);

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
      console.log('API Base URL:', API_BASE_URL);
      console.log('Fetching from:', `${API_BASE_URL}/admin/dashboard/stats`);
      console.log('Token:', token);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
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
        // Show minimal fallback data when API fails
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
            pendingPayments: 0
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
      // Show minimal fallback data when request fails
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
          pendingPayments: 0
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
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Users</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {dashboardData?.stats?.totalUsers?.toLocaleString() || 0}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                {dashboardData?.stats?.totalUsers?.toLocaleString() || 0} Registered Users
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Orders</h3>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                {dashboardData?.stats?.totalOrders?.toLocaleString() || 0}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                ${dashboardData?.stats?.totalSales?.toLocaleString() || '0'} in Sales
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Wallet Balance</h3>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                ${dashboardData?.stats?.totalWalletBalance?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                User Wallet Balances
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">MLM Earnings</h3>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
                ${dashboardData?.stats?.totalMlmEarnings?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                Total MLM Commissions
              </p>
            </div>
          </div>
          
          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Pending Withdrawals</h3>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">
                {dashboardData?.stats?.pendingWithdrawals || 0}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                ${dashboardData?.stats?.totalWithdrawalAmount?.toLocaleString() || '0'} Requested
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Pending Payments</h3>
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                {dashboardData?.stats?.pendingPayments || 0}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                Payment Confirmations
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Available Products</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {dashboardData?.stats?.totalProducts || 0}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                Products in Catalog
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Today's Earnings</h3>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                ${dashboardData?.stats?.todayEarnings?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                Commission Earned Today
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Sales Dynamics Chart */}
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
              <div className="mt-2 text-sm text-gray-600">
                Total Revenue: ${dashboardData?.stats?.totalRevenue?.toLocaleString() || '0'}
              </div>
            </div>
            
            {/* User Growth Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">User Growth (Last 7 Days)</h3>
              <div className="h-64">
                <BarChart 
                  data={dashboardData?.userGrowth?.map(item => ({
                    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: parseInt(item.new_users || 0)
                  })) || []} 
                  color="#3b82f6"
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Total Users: {dashboardData?.stats?.totalUsers?.toLocaleString() || 0}
              </div>
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
                          <td className="py-3 text-sm text-gray-600">
                            {order.quantity}
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
        </div>
      </div>
    </div>
  );
}
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
                              <div>
                                <div className="text-sm font-medium">{order.product_name}</div>
                                <div className="text-xs text-gray-500">{order.customer_name}</div>
                              </div>
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
                                : order.order_status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1)}
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

          {/* Right Column - Business Overview & MLM Breakdown */}
          <div className="space-y-6 sm:space-y-8">
            {/* Business Overview */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Business Overview</h3>
              
              <div className="mb-4 sm:mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h4>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">
                  ${dashboardData?.stats?.totalRevenue?.toLocaleString() || '0'}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {dashboardData?.stats?.pendingWithdrawals || 0}
                    </div>
                    <div className="text-xs text-gray-600">Pending Withdrawals</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">
                      {dashboardData?.stats?.pendingPayments || 0}
                    </div>
                    <div className="text-xs text-gray-600">Pending Payments</div>
                  </div>
                </div>
                <button className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base">
                  View Cashout Requests
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
                    <span className="ml-2 text-gray-900">{dashboardData?.businessInfo?.name || settings.businessName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">{dashboardData?.businessInfo?.email || settings.businessEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-900">{dashboardData?.businessInfo?.phone || settings.businessPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <span className="ml-2 text-gray-900">{dashboardData?.businessInfo?.address || settings.businessAddress}</span>
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
                    <span className="ml-2 text-gray-900">{dashboardData?.businessInfo?.bankName || settings.bankName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Account Number:</span>
                    <span className="ml-2 text-gray-900">{dashboardData?.businessInfo?.accountNumber || settings.accountNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MLM Earnings Breakdown */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">MLM Earnings Breakdown</h3>
              <div className="space-y-4">
                {dashboardData?.mlmBreakdown?.length > 0 ? (
                  dashboardData.mlmBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {item.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.transaction_count} transactions
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${parseFloat(item.total_amount || 0).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No MLM earnings data available
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Withdrawals */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Withdrawals</h3>
              <div className="space-y-3">
                {dashboardData?.recentWithdrawals?.length > 0 ? (
                  dashboardData.recentWithdrawals.slice(0, 5).map((withdrawal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {withdrawal.full_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {withdrawal.bank_name} - {withdrawal.account_number}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ${parseFloat(withdrawal.amount || 0).toLocaleString()}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          withdrawal.status === 'pending' 
                            ? 'bg-orange-100 text-orange-600' 
                            : withdrawal.status === 'approved'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {withdrawal.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No recent withdrawals
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}