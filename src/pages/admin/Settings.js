import React, { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, ShieldCheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../../contexts/SettingsContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Password & Security');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { settings, updateSettings } = useSettings();
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
    'Business Details',
    'Business Account Details',
    'Pick-Up Stations',
    'Password & Security'
  ];

  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@baobab.com',
    phone: '+2348012345678',
    role: 'Super Admin'
  });

  const [businessData, setBusinessData] = useState({
    name: settings.businessName,
    email: settings.businessEmail,
    phone: settings.businessPhone,
    address: settings.businessAddress,
    description: 'Leading MLM business in Nigeria'
  });

  const [accountData, setAccountData] = useState({
    bankName: settings.bankName,
    accountNumber: settings.accountNumber,
    accountName: settings.accountName
  });

  useEffect(() => {
    setBusinessData({
      name: settings.businessName,
      email: settings.businessEmail,
      phone: settings.businessPhone,
      address: settings.businessAddress,
      description: 'Leading MLM business in Nigeria'
    });
    setAccountData({
      bankName: settings.bankName,
      accountNumber: settings.accountNumber,
      accountName: settings.accountName
    });
  }, [settings]);

  const updateBusinessDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/settings/business`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_name: businessData.name,
          business_email: businessData.email,
          business_phone: businessData.phone,
          business_address: businessData.address
        })
      });
      
      if (response.ok) {
        updateSettings({
          businessName: businessData.name,
          businessEmail: businessData.email,
          businessPhone: businessData.phone,
          businessAddress: businessData.address
        });
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (error) {
      console.error('Failed to update business details:', error);
    }
  };

  const updateAccountDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/settings/account`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bank_name: accountData.bankName,
          account_number: accountData.accountNumber,
          account_name: accountData.accountName
        })
      });
      
      if (response.ok) {
        updateSettings({
          bankName: accountData.bankName,
          accountNumber: accountData.accountNumber,
          accountName: accountData.accountName
        });
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (error) {
      console.error('Failed to update account details:', error);
    }
  };

  const [pickupStations, setPickupStations] = useState([
    { id: 1, name: 'Lagos Main', address: 'Victoria Island, Lagos', phone: '+2348012345678', active: true },
    { id: 2, name: 'Abuja Branch', address: 'Wuse 2, Abuja', phone: '+2348012345679', active: true },
    { id: 3, name: 'Port Harcourt', address: 'GRA, Port Harcourt', phone: '+2348012345680', active: false }
  ]);

  const [showAddStationModal, setShowAddStationModal] = useState(false);

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
            {activeTab === 'Profile Details' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Admin Profile Details</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select 
                        value={profileData.role}
                        onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option>Super Admin</option>
                        <option>Admin</option>
                        <option>Manager</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg">
                    Update Profile
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'Business Details' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input 
                        type="text" 
                        value={businessData.name}
                        onChange={(e) => setBusinessData({...businessData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                      <input 
                        type="email" 
                        value={businessData.email}
                        onChange={(e) => setBusinessData({...businessData, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                      <input 
                        type="tel" 
                        value={businessData.phone}
                        onChange={(e) => setBusinessData({...businessData, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input 
                        type="text" 
                        value={businessData.address}
                        onChange={(e) => setBusinessData({...businessData, address: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                    <textarea 
                      value={businessData.description}
                      onChange={(e) => setBusinessData({...businessData, description: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <button 
                    type="submit" 
                    onClick={updateBusinessDetails}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg"
                  >
                    Update Business Details
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'Business Account Details' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Bank Account Information</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input 
                        type="text" 
                        value={accountData.bankName}
                        onChange={(e) => setAccountData({...accountData, bankName: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input 
                        type="text" 
                        value={accountData.accountNumber}
                        onChange={(e) => setAccountData({...accountData, accountNumber: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                      <input 
                        type="text" 
                        value={accountData.accountName}
                        onChange={(e) => setAccountData({...accountData, accountName: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    onClick={updateAccountDetails}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg"
                  >
                    Update Account Details
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'Pick-Up Stations' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Pick-Up Stations</h3>
                  <button 
                    onClick={() => setShowAddStationModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Station
                  </button>
                </div>
                
                <div className="space-y-4">
                  {pickupStations.map((station) => (
                    <div key={station.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-900 mr-3">{station.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              station.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {station.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{station.address}</p>
                          <p className="text-sm text-gray-600">{station.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

      {/* Add Station Modal */}
      {showAddStationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Pick-Up Station</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter station name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="w-full px-3 py-2 border rounded-lg" placeholder="Enter phone number" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="active" className="mr-2" defaultChecked />
                <label htmlFor="active" className="text-sm">Station is active</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddStationModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Add Station
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
            <p className="text-sm text-gray-600 mb-4">Your information has been updated successfully.</p>
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