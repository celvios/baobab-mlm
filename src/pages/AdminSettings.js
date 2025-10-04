import React from 'react';

const AdminSettings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" defaultValue="Baobab" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2" defaultValue="admin@baobab.com" />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Changes</button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2" defaultValue="30" />
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">Enable two-factor authentication</span>
              </label>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Update Security</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;