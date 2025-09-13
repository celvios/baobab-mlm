import React, { useState } from 'react';
import { PencilIcon, CheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Password & Security');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setShowPasswordModal(false);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const tabs = [
    'Profile Details',
    'Business Business Details',
    'Business Account Details',
    'Push-Up Statistic',
    'Password & Security'
  ];

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600 text-sm mb-6">Manage settings about your business.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'Password & Security' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Password & Security</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                        <ShieldCheckIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Security Status</h4>
                        <p className="text-sm text-gray-500">Change Password</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Password & Security Details</h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Security Status</label>
                      <p className="text-sm text-gray-900">Secured</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <p className="text-sm text-gray-900">••••••••</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'Password & Security' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Content for {activeTab} tab</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password & Security Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Password & Security</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Edit/Update your Password</p>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Password & Security</h4>
                <p className="text-sm text-gray-600 mb-4">Old Password</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                <input 
                  type="password" 
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Information Updated Successfully</h3>
            <p className="text-sm text-gray-600 mb-4">Your password has been updated successfully.</p>
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