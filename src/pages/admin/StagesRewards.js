import React, { useState } from 'react';
import { PencilIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function StagesRewards() {
  const [stages] = useState([
    { id: 1, name: 'Feeder', requirement: '₦18,000 + 2 referrals', reward: '₦4,500', members: 1250, status: 'Active' },
    { id: 2, name: 'Bronze', requirement: '6 referrals', reward: '₦18,000', members: 890, status: 'Active' },
    { id: 3, name: 'Silver', requirement: '14 referrals', reward: '₦72,000', members: 340, status: 'Active' },
    { id: 4, name: 'Gold', requirement: '30 referrals', reward: '₦288,000', members: 125, status: 'Active' },
    { id: 5, name: 'Diamond', requirement: '62 referrals', reward: '₦1,152,000', members: 45, status: 'Active' }
  ]);

  const [repurchaseSettings] = useState([
    { stage: 'Feeder', required: true, amount: 4500, products: 'Any ₦4,500 worth' },
    { stage: 'Bronze', required: true, amount: 18000, products: 'Any ₦18,000 worth' },
    { stage: 'Silver', required: true, amount: 72000, products: 'Any ₦72,000 worth' },
    { stage: 'Gold', required: true, amount: 288000, products: 'Any ₦288,000 worth' },
    { stage: 'Diamond', required: false, amount: 0, products: 'Optional' }
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

      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">MLM Stages Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Manage MLM stages, requirements, and reward structures.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Members</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">2,650</div>
              <p className="text-gray-500 text-sm">Across All Stages</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Active Stages</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">5</div>
              <p className="text-gray-500 text-sm">MLM Stages</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Rewards Paid</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">₦45.2M</div>
              <p className="text-gray-500 text-sm">This Month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Pending Payouts</h3>
              <div className="text-3xl font-bold text-orange-600 mb-2">₦2.1M</div>
              <p className="text-gray-500 text-sm">Awaiting Processing</p>
            </div>
          </div>
        </div>

        {/* MLM Stages */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">MLM Stages Configuration</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stages.map((stage) => (
                  <tr key={stage.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">{stage.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{stage.requirement}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{stage.reward}</td>
                    <td className="px-6 py-4 text-sm">{stage.members.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {stage.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Repurchase Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Repurchase Requirements</h3>
            <p className="text-sm text-gray-600 mt-1">Configure repurchase requirements for each stage</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {repurchaseSettings.map((setting, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium">{setting.stage}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        setting.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {setting.required ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {setting.amount > 0 ? `₦${setting.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">{setting.products}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800">
                        <PencilIcon className="h-4 w-4" />
                      </button>
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