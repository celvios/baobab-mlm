import React from 'react';

const AdminAnalytics = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">User Growth</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Revenue Trends</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Top Performing Products</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Product A</span>
              <span className="font-medium">$1,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Product B</span>
              <span className="font-medium">$987</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Product C</span>
              <span className="font-medium">$654</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-gray-500">2 hours ago</span>
              <p>New user registered</p>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">4 hours ago</span>
              <p>Withdrawal approved</p>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">6 hours ago</span>
              <p>Order completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;