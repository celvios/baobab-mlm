import React from 'react';

const AdminStats = ({ stats }) => {
  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
    { title: 'Active Orders', value: stats?.activeOrders || 0, icon: '📦' },
    { title: 'Deposit Requests', value: stats?.pendingPayments || 0, icon: '💳' },
    { title: 'Pending Withdrawals', value: stats?.pendingWithdrawals || 0, icon: '💰' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;