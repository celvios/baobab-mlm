import React, { useState, useEffect } from 'react';
import { FiUser, FiHome, FiLock, FiMapPin, FiSave, FiDollarSign } from 'react-icons/fi';
// import ExchangeRateManager from '../../components/admin/ExchangeRateManager';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({});

  const AdminProfile = () => {
    const [profileData, setProfileData] = useState({
      full_name: '',
      email: '',
      phone: '',
      role: 'admin'
    });

    const handleSaveProfile = async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/admin/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(profileData)
        });
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Admin Profile Details</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.full_name}
              onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
          >
            <FiSave className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    );
  };

  const BusinessDetails = () => {
    const [businessData, setBusinessData] = useState({
      company_name: '',
      company_address: '',
      company_phone: '',
      company_email: '',
      tax_id: '',
      registration_number: ''
    });

    const handleSaveBusiness = async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/admin/business-details', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(businessData)
        });
        alert('Business details updated successfully!');
      } catch (error) {
        console.error('Error updating business details:', error);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Baobab Business Details</h2>
        <form onSubmit={handleSaveBusiness} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={businessData.company_name}
              onChange={(e) => setBusinessData({...businessData, company_name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
            <textarea
              value={businessData.company_address}
              onChange={(e) => setBusinessData({...businessData, company_address: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-20"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
              <input
                type="tel"
                value={businessData.company_phone}
                onChange={(e) => setBusinessData({...businessData, company_phone: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
              <input
                type="email"
                value={businessData.company_email}
                onChange={(e) => setBusinessData({...businessData, company_email: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
              <input
                type="text"
                value={businessData.tax_id}
                onChange={(e) => setBusinessData({...businessData, tax_id: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
              <input
                type="text"
                value={businessData.registration_number}
                onChange={(e) => setBusinessData({...businessData, registration_number: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
          >
            <FiSave className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    );
  };

  const SecuritySettings = () => {
    const [securityData, setSecurityData] = useState({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });

    const handleChangePassword = async (e) => {
      e.preventDefault();
      if (securityData.new_password !== securityData.confirm_password) {
        alert('New passwords do not match!');
        return;
      }
      try {
        await fetch('/api/admin/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(securityData)
        });
        alert('Password changed successfully!');
        setSecurityData({ current_password: '', new_password: '', confirm_password: '' });
      } catch (error) {
        console.error('Error changing password:', error);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Password & Security</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={securityData.current_password}
              onChange={(e) => setSecurityData({...securityData, current_password: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={securityData.new_password}
              onChange={(e) => setSecurityData({...securityData, new_password: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={securityData.confirm_password}
              onChange={(e) => setSecurityData({...securityData, confirm_password: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
          >
            <FiSave className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </form>
      </div>
    );
  };

  const PickupStations = () => {
    const [stations, setStations] = useState([]);
    const [newStation, setNewStation] = useState({
      name: '',
      address: '',
      phone: '',
      contact_person: ''
    });

    const addStation = async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/admin/pickup-stations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(newStation)
        });
        setNewStation({ name: '', address: '', phone: '', contact_person: '' });
        // Refresh stations list
      } catch (error) {
        console.error('Error adding pickup station:', error);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Pick-Up Stations</h2>
        <form onSubmit={addStation} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Station Name"
              value={newStation.name}
              onChange={(e) => setNewStation({...newStation, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newStation.phone}
              onChange={(e) => setNewStation({...newStation, phone: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Contact Person"
            value={newStation.contact_person}
            onChange={(e) => setNewStation({...newStation, contact_person: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <textarea
            placeholder="Station Address"
            value={newStation.address}
            onChange={(e) => setNewStation({...newStation, address: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-20"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
          >
            <FiMapPin className="w-4 h-4" />
            <span>Add Station</span>
          </button>
        </form>
        
        <div className="space-y-3">
          {stations.map((station, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{station.name}</h4>
                  <p className="text-sm text-gray-600">{station.address}</p>
                  <p className="text-sm text-gray-600">Contact: {station.contact_person} - {station.phone}</p>
                </div>
                <button className="text-red-600 hover:text-red-900 text-sm">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600">Manage system and account settings</p>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUser className="inline w-4 h-4 mr-2" />
            Admin Profile
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'business'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiHome className="inline w-4 h-4 mr-2" />
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiLock className="inline w-4 h-4 mr-2" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('pickup')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pickup'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiMapPin className="inline w-4 h-4 mr-2" />
            Pick-Up Stations
          </button>

        </nav>
      </div>

      {activeTab === 'profile' && <AdminProfile />}
      {activeTab === 'business' && <BusinessDetails />}
      {activeTab === 'security' && <SecuritySettings />}
      {activeTab === 'pickup' && <PickupStations />}
    </div>
  );
};

export default AdminSettings;