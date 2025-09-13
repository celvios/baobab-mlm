import React, { useState } from 'react';
import { PaperAirplaneIcon, UserGroupIcon, EnvelopeIcon, TrashIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function Emailer() {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'history'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  const [emailData, setEmailData] = useState({
    recipients: 'all',
    subject: '',
    message: ''
  });

  const [emailList] = useState([
    { id: 1, email: 'alison@gmail.com', status: 'Subscribed', category: 'All Users' },
    { id: 2, email: 'john@gmail.com', status: 'Subscribed', category: 'All Users' },
    { id: 3, email: 'jane@gmail.com', status: 'Subscribed', category: 'All Users' },
    { id: 4, email: 'mike@gmail.com', status: 'Subscribed', category: 'All Users' },
    { id: 5, email: 'sarah@gmail.com', status: 'Subscribed', category: 'All Users' },
    { id: 6, email: 'david@gmail.com', status: 'Subscribed', category: 'All Users' },
    { id: 7, email: 'lisa@gmail.com', status: 'Subscribed', category: 'All Users' }
  ]);

  const [emailHistory] = useState([
    { id: 1, date: '12/03/25', recipient: 'All Users', category: 'All Users', body: 'Thank you for joining the Baobab – you\'re one step closer to be...', status: 'Sent' },
    { id: 2, date: '12/04/25', recipient: 'All Users', category: 'All Users', body: 'Thank you for joining the Baobab – you\'re one step closer to be...', status: 'Sent' },
    { id: 3, date: '12/03/25', recipient: 'Onboarded', category: 'Onboarded', body: 'Thank you for joining the Baobab – you\'re one step closer to be...', status: 'Sent' },
    { id: 4, date: '12/03/25', recipient: 'Pending', category: 'Pending', body: 'Thank you for joining the Baobab – you\'re one step closer to be...', status: 'Sent' },
    { id: 5, date: '12/03/25', recipient: 'Pending', category: 'Pending', body: 'Thank you for joining the Baobab – you\'re one step closer to be...', status: 'Sent' },
    { id: 6, date: '12/04/25', recipient: 'Pending', category: 'Pending', body: 'Thank you for joining the Baobab – you\'re one step closer to be...', status: 'Sent' },
    { id: 7, date: '12/04/25', recipient: 'Unsubscribed', category: 'Unsubscribed', body: 'Thank you for joining the Baobab – you\'re one step closer to be...', status: 'Sent' }
  ]);

  const handleCreateEmail = () => {
    setShowCreateModal(true);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    setShowCreateModal(false);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setCurrentView('history');
    }, 2000);
  };

  const handleRemoveUser = (email) => {
    setSelectedEmail(email);
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    setShowRemoveModal(false);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Subscribed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Unsubscribed': return 'bg-red-100 text-red-800';
      case 'Onboarded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Emailer</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Emailer</h2>
          <p className="text-gray-600 text-sm mb-6">View and manage all your mails.</p>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6">
            <button 
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                currentView === 'list' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Emailer
            </button>
            <button 
              onClick={() => setCurrentView('history')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                currentView === 'history' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Email History
            </button>
          </div>
        </div>

        {/* Email List View */}
        {currentView === 'list' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Emailer</h3>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleCreateEmail}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Send Mail
                  </button>
                  <button 
                    onClick={() => setCurrentView('history')}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm"
                  >
                    View History
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {emailList.map((email, index) => (
                    <tr key={email.id}>
                      <td className="px-6 py-4 text-sm">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                            <EnvelopeIcon className="h-4 w-4 text-yellow-600" />
                          </div>
                          <span className="text-sm">{email.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(email.status)}`}>
                          {email.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{email.category}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleRemoveUser(email)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Email History View */}
        {currentView === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Email History</h3>
                <div className="flex space-x-3">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                    Delete All
                  </button>
                  <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                    Sort By
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-4 mb-4">
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
                  Sent
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  Draft
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mail Body</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {emailHistory.map((email, index) => (
                    <tr key={email.id}>
                      <td className="px-6 py-4 text-sm">{index + 1}</td>
                      <td className="px-6 py-4 text-sm">{email.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex -space-x-1 mr-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
                          </div>
                          <span className="text-sm">{email.recipient}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(email.category)}`}>
                          {email.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm max-w-xs truncate">{email.body}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {email.status}
                        </span>
                      </td>
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
        )}
      </div>

      {/* Create Email Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Mail</h3>
            <p className="text-sm text-gray-600 mb-4">Create/Edit mails</p>
            
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Create/Edit mail</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option>Select recipient</option>
                  <option>All Users</option>
                  <option>Subscribed Users</option>
                  <option>Pending Users</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="Enter subject"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea 
                  placeholder="Enter message body"
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  placeholder="Enter additional message"
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mail Cover</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <button type="button" className="text-blue-600 text-sm">Choose file to upload</button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">With Cover</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <button type="button" className="text-blue-600 text-sm">Choose file to upload</button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg text-sm"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  Create Mail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove User Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove this user?</h3>
            <p className="text-sm text-gray-600 mb-6">Please confirm whether you want to proceed with this action.</p>
            <p className="text-sm text-gray-600 mb-6">This user will be removed from your mail list and removed</p>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemove}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Delete
              </button>
            </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showRemoveModal ? 'Congratulations.' : 'Email Created Successful'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {showRemoveModal 
                ? 'This user has been removed successfully. Please proceed to create new.' 
                : 'An automatic email will receive this email.'
              }
            </p>
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