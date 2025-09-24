import React, { useState } from 'react';

const AdminSetup = () => {
  const [formData, setFormData] = useState({
    email: 'admin@baobab.com',
    password: 'admin123',
    fullName: 'Admin User'
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Test if backend is working
      const healthResponse = await fetch('https://baobab-backend.onrender.com/api/health');
      if (!healthResponse.ok) {
        throw new Error('Backend is not responding');
      }
      
      // Setup database first
      const setupResponse = await fetch('https://baobab-backend.onrender.com/api/setup-database');
      const setupData = await setupResponse.json();
      
      // Create admin using existing endpoint
      const adminResponse = await fetch('https://baobab-backend.onrender.com/api/setup-admin');
      const adminData = await adminResponse.json();
      
      setMessage('Admin setup completed! Use email: admin@baobabmlm.com, password: password');
    } catch (error) {
      setMessage('Error: ' + error.message + '. Backend may be down.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Admin Setup</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
            Create Admin
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default AdminSetup;