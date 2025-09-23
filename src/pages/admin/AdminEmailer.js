import React, { useState, useEffect } from 'react';
import { FiMail, FiSend, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';

const AdminEmailer = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [emailHistory, setEmailHistory] = useState([]);
  const [mailingList, setMailingList] = useState([]);

  const ComposeEmail = () => {
    const [emailData, setEmailData] = useState({
      subject: '',
      message: '',
      recipients: 'all'
    });

    const handleSendEmail = async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/admin/emails/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(emailData)
        });
        alert('Email sent successfully!');
        setEmailData({ subject: '', message: '', recipients: 'all' });
        setActiveTab('history');
      } catch (error) {
        console.error('Error sending email:', error);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Compose Email</h2>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <select
              value={emailData.recipients}
              onChange={(e) => setEmailData({...emailData, recipients: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users Only</option>
              <option value="inactive">Inactive Users Only</option>
              <option value="custom">Custom List</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter email subject"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={emailData.message}
              onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              rows="8"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your message here..."
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
          >
            <FiSend className="w-4 h-4" />
            <span>Send Email</span>
          </button>
        </form>
      </div>
    );
  };

  const EmailHistory = () => {
    useEffect(() => {
      fetchEmailHistory();
    }, []);

    const fetchEmailHistory = async () => {
      try {
        const response = await fetch('/api/admin/emails/history', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        setEmailHistory(data.emails);
      } catch (error) {
        console.error('Error fetching email history:', error);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Email History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emailHistory.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                    <div className="text-sm text-gray-500">{email.message.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {email.recipient_count} users
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(email.sent_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      email.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {email.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const MailingList = () => {
    useEffect(() => {
      fetchMailingList();
    }, []);

    const fetchMailingList = async () => {
      try {
        const response = await fetch('/api/admin/emails/mailing-list', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        setMailingList(data.users);
      } catch (error) {
        console.error('Error fetching mailing list:', error);
      }
    };

    const removeFromMailingList = async (userId) => {
      if (window.confirm('Remove this user from mailing list?')) {
        try {
          await fetch(`/api/admin/emails/mailing-list/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
          });
          fetchMailingList();
        } catch (error) {
          console.error('Error removing user from mailing list:', error);
        }
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Mailing List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mailingList.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-medium">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => removeFromMailingList(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
        <p className="text-gray-600">Send emails and manage mailing lists</p>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compose'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiMail className="inline w-4 h-4 mr-2" />
            Compose Email
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Email History
          </button>
          <button
            onClick={() => setActiveTab('mailing-list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mailing-list'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mailing List
          </button>
        </nav>
      </div>

      {activeTab === 'compose' && <ComposeEmail />}
      {activeTab === 'history' && <EmailHistory />}
      {activeTab === 'mailing-list' && <MailingList />}
    </div>
  );
};

export default AdminEmailer;