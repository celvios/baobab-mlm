import React, { useState, useEffect } from 'react';
import { FiMail, FiSend, FiTrash2, FiEye } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import apiService from '../../services/api';

// Custom styles for ReactQuill
const editorStyle = {
  '.ql-container': {
    minHeight: '200px',
    fontSize: '14px'
  },
  '.ql-editor': {
    minHeight: '200px'
  }
};

const ComposeEmail = ({ allUsers, setAllUsers, setActiveTab }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const response = await apiService.getAllUsers();
      setAllUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

    const handleSendEmail = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await apiService.sendEmail({
          subject,
          message,
          category,
          selectedUsers
        });
        alert('Email sent successfully!');
        setSubject('');
        setMessage('');
        setCategory('all');
        setSelectedUsers([]);
        setActiveTab('history');
      } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Compose Email</h2>
      <form onSubmit={handleSendEmail} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Users ({allUsers.length})</option>
            <option value="feeder">Feeder Level</option>
            <option value="bronze">Bronze Level</option>
            <option value="silver">Silver Level</option>
            <option value="gold">Gold Level</option>
            <option value="diamond">Diamond Level</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter email subject"
            autoComplete="off"
            required
          />
        </div>
        
        <div style={{ marginBottom: '80px' }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <div style={{ backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
            <ReactQuill
              theme="snow"
              value={message}
              onChange={setMessage}
              placeholder="Enter your message here..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'color': [] }, { 'background': [] }],
                  ['link'],
                  ['clean']
                ]
              }}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !subject.trim() || !message.trim()}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center space-x-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiSend className="w-4 h-4" />
          <span>{loading ? 'Sending...' : 'Send Email'}</span>
        </button>
      </form>
    </div>
  );
};

const AdminEmailer = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [emailHistory, setEmailHistory] = useState([]);
  const [mailingList, setMailingList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const EmailHistory = () => {
    useEffect(() => {
      fetchEmailHistory();
    }, []);

    const fetchEmailHistory = async () => {
      try {
        const response = await apiService.getEmailHistory();
        setEmailHistory(response.emails || []);
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
                    {email.sentCount || email.recipientCount} users
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(email.createdAt).toLocaleDateString()}
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
        const response = await apiService.getAllUsers();
        setMailingList(response.users || []);
      } catch (error) {
        console.error('Error fetching mailing list:', error);
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
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
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

      {activeTab === 'compose' && <ComposeEmail allUsers={allUsers} setAllUsers={setAllUsers} setActiveTab={setActiveTab} />}
      {activeTab === 'history' && <EmailHistory />}
      {activeTab === 'mailing-list' && <MailingList />}
    </div>
  );
};

export default AdminEmailer;