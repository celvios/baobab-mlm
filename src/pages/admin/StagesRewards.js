import React, { useState } from 'react';
import { PencilIcon, CurrencyDollarIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function StagesRewards() {
  const [stages] = useState([
    { id: 1, name: 'Feeder', requirement: '₦18,000 + 2 referrals', reward: '₦4,500', members: 1250, status: 'Active', color: 'bg-gray-500' },
    { id: 2, name: 'Bronze', requirement: '6 referrals', reward: '₦18,000', members: 890, status: 'Active', color: 'bg-orange-600' },
    { id: 3, name: 'Silver', requirement: '14 referrals', reward: '₦72,000', members: 340, status: 'Active', color: 'bg-gray-400' },
    { id: 4, name: 'Gold', requirement: '30 referrals', reward: '₦288,000', members: 125, status: 'Active', color: 'bg-yellow-500' },
    { id: 5, name: 'Diamond', requirement: '62 referrals', reward: '₦1,152,000', members: 45, status: 'Active', color: 'bg-blue-500' }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [stageData, setStageData] = useState({
    name: '',
    requirement: '',
    reward: '',
    description: ''
  });

  const handleCreateStage = (e) => {
    e.preventDefault();
    setShowCreateModal(false);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

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

      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Stages & Rewards</h2>
          <p className="text-gray-600 text-sm mb-6">Manage MLM stages, requirements, and reward structures.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Members</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">2,650</div>
              <p className="text-gray-500 text-xs sm:text-sm">Across All Stages</p>
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
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">MLM Stages Configuration</h3>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm w-full sm:w-auto justify-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Stage
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirements</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repurchase Requirement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repurchase Amount</th>
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
                        <div className={`w-8 h-8 ${stage.color} rounded-full flex items-center justify-center mr-3`}>
                          <span className="text-white text-xs font-bold">{stage.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium">{stage.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{stage.requirement}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{stage.reward}</td>
                    <td className="px-6 py-4 text-sm">Required</td>
                    <td className="px-6 py-4 text-sm">{stage.reward}</td>
                    <td className="px-6 py-4 text-sm">{stage.members.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {stage.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="text-blue-600 hover:text-blue-800"
                      >
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

      {/* Create/Edit Stage Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create/Edit Stage</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Create/Edit Stage</p>
            
            <form onSubmit={handleCreateStage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <input 
                  type="text" 
                  value={stageData.name}
                  onChange={(e) => setStageData({...stageData, name: e.target.value})}
                  placeholder="Enter stage name"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirement</label>
                <input 
                  type="text" 
                  value={stageData.requirement}
                  onChange={(e) => setStageData({...stageData, requirement: e.target.value})}
                  placeholder="Enter requirements"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reward</label>
                <input 
                  type="text" 
                  value={stageData.reward}
                  onChange={(e) => setStageData({...stageData, reward: e.target.value})}
                  placeholder="Enter reward amount"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repurchase Requirement</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Select requirement</option>
                  <option>Required</option>
                  <option>Optional</option>
                  <option>Not Required</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repurchase Amount</label>
                <input 
                  type="number" 
                  placeholder="Enter repurchase amount"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage Color</label>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-500 rounded cursor-pointer border-2 border-gray-300"></div>
                  <div className="w-8 h-8 bg-orange-600 rounded cursor-pointer border-2 border-gray-300"></div>
                  <div className="w-8 h-8 bg-gray-400 rounded cursor-pointer border-2 border-gray-300"></div>
                  <div className="w-8 h-8 bg-yellow-500 rounded cursor-pointer border-2 border-gray-300"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded cursor-pointer border-2 border-gray-300"></div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={stageData.description}
                  onChange={(e) => setStageData({...stageData, description: e.target.value})}
                  placeholder="Enter stage description"
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Congratulations.</h3>
            <p className="text-sm text-gray-600 mb-4">New Stage has been created successfully. All users will be proceeded to create new.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-2 bg-gray-900 text-white rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}