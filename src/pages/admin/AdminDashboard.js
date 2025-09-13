import React, { useState, useEffect } from 'react';
import { BellIcon, PencilIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import ProcessLoader from '../../components/ProcessLoader';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
                ₦{dashboardData?.stats?.totalSales?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                ₦{dashboardData?.stats?.totalSales?.toLocaleString() || '0'} Products Sales
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
                ₦{dashboardData?.stats?.todayEarnings?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                ₦{dashboardData?.stats?.todayEarnings?.toLocaleString() || '0'} Earned Today
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
              <div className="h-64 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 600 200">
                  {/* Chart lines */}
                  <path d="M50 150 Q150 100 250 120 T450 80 T550 100" stroke="#10b981" strokeWidth="3" fill="none" />
                  <path d="M50 120 Q150 80 250 100 T450 60 T550 80" stroke="#6366f1" strokeWidth="3" fill="none" />
                  <path d="M50 100 Q150 140 250 110 T450 130 T550 120" stroke="#374151" strokeWidth="3" fill="none" />
                  
                  {/* X-axis labels */}
                  <text x="80" y="190" className="text-xs fill-gray-500">FEB</text>
                  <text x="150" y="190" className="text-xs fill-gray-500">MAR</text>
                  <text x="220" y="190" className="text-xs fill-gray-500">APR</text>
                  <text x="290" y="190" className="text-xs fill-gray-500">MAY</text>
                  <text x="360" y="190" className="text-xs fill-gray-500">JUN</text>
                  <text x="430" y="190" className="text-xs fill-gray-500">JUL</text>
                  
                  {/* Y-axis labels */}
                  <text x="20" y="160" className="text-xs fill-gray-500">0M</text>
                  <text x="20" y="130" className="text-xs fill-gray-500">50M</text>
                  <text x="20" y="100" className="text-xs fill-gray-500">100M</text>
                  
                  {/* Legend */}
                  <text x="450" y="30" className="text-xs fill-gray-500">Mar 18 #98k</text>
                </svg>
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
                            ₦{order.total_amount?.toLocaleString()}
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
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">#6,244,500</div>
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
                    <span className="ml-2 text-gray-900">Baobab/MLM business co.</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">baobabmlm@yahoo.com</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-900">+2348012345678</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <span className="ml-2 text-gray-900">Ikeja, Lagos</span>
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
                    <span className="ml-2 text-gray-900">Jaiz Microfinance Bank</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Account Number:</span>
                    <span className="ml-2 text-gray-900">0012345678</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Earnings Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Daily Earnings</h3>
              <div className="h-40 sm:h-48">
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  {/* Bar chart */}
                  <rect x="20" y="100" width="15" height="40" fill="#10b981" />
                  <rect x="45" y="80" width="15" height="60" fill="#10b981" />
                  <rect x="70" y="60" width="15" height="80" fill="#10b981" />
                  <rect x="95" y="70" width="15" height="70" fill="#10b981" />
                  <rect x="120" y="50" width="15" height="90" fill="#10b981" />
                  <rect x="145" y="40" width="15" height="100" fill="#10b981" />
                  <rect x="170" y="90" width="15" height="50" fill="#10b981" />
                  
                  {/* Y-axis labels */}
                  <text x="5" y="145" className="text-xs fill-gray-500">0</text>
                  <text x="5" y="115" className="text-xs fill-gray-500">100k</text>
                  <text x="5" y="85" className="text-xs fill-gray-500">200k</text>
                  <text x="5" y="55" className="text-xs fill-gray-500">300k</text>
                  
                  {/* X-axis labels */}
                  <text x="25" y="160" className="text-xs fill-gray-500">M</text>
                  <text x="50" y="160" className="text-xs fill-gray-500">T</text>
                  <text x="75" y="160" className="text-xs fill-gray-500">W</text>
                  <text x="100" y="160" className="text-xs fill-gray-500">Th</text>
                  <text x="125" y="160" className="text-xs fill-gray-500">F</text>
                  <text x="150" y="160" className="text-xs fill-gray-500">S</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}