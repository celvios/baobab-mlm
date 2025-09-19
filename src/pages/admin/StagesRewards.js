import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function StagesRewards() {
  const [stages, setStages] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStages();
    fetchStats();
  }, []);

  const fetchStages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/stages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStages(data.stages);
      }
    } catch (error) {
      console.error('Failed to fetch stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/stages/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const [dummyStages] = useState([
    { id: 1, name: 'Feeder', requirement: '₦18,000 + 2 referrals', reward: '₦4,500', members: 1250, status: 'Active', color: 'bg-gray-500' },
    { id: 2, name: 'Bronze', requirement: '6 referrals', reward: '₦18,000', members: 890, status: 'Active', color: 'bg-orange-600' },
    { id: 3, name: 'Silver', requirement: '14 referrals', reward: '₦72,000', members: 340, status: 'Active', color: 'bg-gray-400' },
    { id: 4, name: 'Gold', requirement: '30 referrals', reward: '₦288,000', members: 125, status: 'Active', color: 'bg-yellow-500' },
    { id: 5, name: 'Diamond', requirement: '62 referrals', reward: '₦1,152,000', members: 45, status: 'Active', color: 'bg-blue-500' }
  ]);

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Stages & Rewards</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Stages & Rewards</h2>
          <p className="text-gray-600 text-sm mb-6">View MLM stages, requirements, and reward structures.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Members</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{stats.totalMembers || 0}</div>
              <p className="text-gray-500 text-xs sm:text-sm">Across All Stages</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Active Stages</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeStages || 0}</div>
              <p className="text-gray-500 text-sm">MLM Stages</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Rewards Paid</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">${stats.totalRewardsPaid?.toLocaleString() || '0'}</div>
              <p className="text-gray-500 text-sm">This Month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Pending Payouts</h3>
              <div className="text-3xl font-bold text-orange-600 mb-2">${stats.pendingPayouts?.toLocaleString() || '0'}</div>
              <p className="text-gray-500 text-sm">Awaiting Processing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-4 sm:p-6 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">MLM Stages Configuration</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirements</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(stages.length > 0 ? stages : dummyStages).map((stage) => (
                  <tr key={stage.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${stage.color} rounded-full flex items-center justify-center mr-3`}>
                          <span className="text-white text-xs font-bold">{stage.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium">{stage.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{stage.requirements || stage.requirement}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{stage.reward}</td>
                    <td className="px-6 py-4 text-sm">{(stage.member_count || stage.members || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {stage.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}