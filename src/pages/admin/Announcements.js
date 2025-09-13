import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

export default function Announcements() {
  const [announcements] = useState([
    { id: 1, title: 'New Product Launch - Organic Face Cream', message: 'We are excited to announce our latest product...', type: 'Product', priority: 'High', active: true, date: '01/01/25' },
    { id: 2, title: 'System Maintenance Scheduled', message: 'Our platform will undergo maintenance on...', type: 'System', priority: 'Medium', active: true, date: '31/12/24' },
    { id: 3, title: 'Holiday Bonus Program', message: 'Special bonus rewards for the holiday season...', type: 'Promotion', priority: 'High', active: true, date: '30/12/24' },
    { id: 4, title: 'Updated Terms and Conditions', message: 'Please review our updated terms...', type: 'Policy', priority: 'Low', active: false, date: '29/12/24' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Product': return 'bg-blue-100 text-blue-800';
      case 'System': return 'bg-purple-100 text-purple-800';
      case 'Promotion': return 'bg-green-100 text-green-800';
      case 'Policy': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Announcements Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Create and manage announcements for your MLM community.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Announcements</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">24</div>
              <p className="text-gray-500 text-xs sm:text-sm">All Announcements</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Active</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">18</div>
              <p className="text-gray-500 text-sm">Currently Active</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">High Priority</h3>
              <div className="text-3xl font-bold text-red-600 mb-2">5</div>
              <p className="text-gray-500 text-sm">Urgent Announcements</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Views Today</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
              <p className="text-gray-500 text-sm">Total Views</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Manage Announcements</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm w-full sm:w-auto justify-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Announcement
              </button>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input 
                type="text" 
                placeholder="Search announcements..." 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <select className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto">
                <option>All Types</option>
                <option>Product</option>
                <option>System</option>
                <option>Promotion</option>
                <option>Policy</option>
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto">
                <option>All Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {announcements.map((announcement, index) => (
                  <tr key={announcement.id}>
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <SpeakerWaveIcon className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{announcement.message}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${getTypeColor(announcement.type)}`}>
                        {announcement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        announcement.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{announcement.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Announcement</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Announcement Title" className="w-full px-3 py-2 border rounded-lg" />
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Select Type</option>
                <option>Product</option>
                <option>System</option>
                <option>Promotion</option>
                <option>Policy</option>
              </select>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Select Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <textarea placeholder="Announcement Message" className="w-full px-3 py-2 border rounded-lg h-24"></textarea>
              <div className="flex items-center">
                <input type="checkbox" id="active" className="mr-2" />
                <label htmlFor="active" className="text-sm">Make announcement active immediately</label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Create Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}