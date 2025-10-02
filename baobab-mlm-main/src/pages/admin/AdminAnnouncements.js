import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSpeaker } from 'react-icons/fi';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      setAnnouncements(data.announcements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await fetch(`/api/admin/announcements/${announcementId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const CreateAnnouncementModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      message: '',
      type: 'info',
      priority: 'normal',
      expires_at: ''
    });

    useEffect(() => {
      if (editingAnnouncement) {
        setFormData({
          ...editingAnnouncement,
          expires_at: editingAnnouncement.expires_at ? 
            new Date(editingAnnouncement.expires_at).toISOString().split('T')[0] : ''
        });
      }
    }, [editingAnnouncement]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const method = editingAnnouncement ? 'PUT' : 'POST';
        const url = editingAnnouncement ? 
          `/api/admin/announcements/${editingAnnouncement.id}` : 
          '/api/admin/announcements';
        
        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(formData)
        });
        
        setShowCreateModal(false);
        setEditingAnnouncement(null);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error saving announcement:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">
            {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Announcement Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <textarea
              placeholder="Announcement Message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full p-2 border rounded-lg h-24"
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-2 border rounded-lg"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full p-2 border rounded-lg"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              placeholder="Expiry Date (Optional)"
              value={formData.expires_at}
              onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
              className="w-full p-2 border rounded-lg"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                {editingAnnouncement ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAnnouncement(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Manage system-wide announcements</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiSpeaker className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{announcement.message}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                    {announcement.expires_at && (
                      <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingAnnouncement(announcement);
                    setShowCreateModal(true);
                  }}
                  className="text-green-600 hover:text-green-900"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && <CreateAnnouncementModal />}
    </div>
  );
};

export default AdminAnnouncements;