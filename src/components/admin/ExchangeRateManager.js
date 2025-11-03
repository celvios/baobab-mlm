import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const ExchangeRateManager = () => {
  const [currentRate, setCurrentRate] = useState(null);
  const [newRate, setNewRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchCurrentRate();
  }, []);

  const fetchCurrentRate = async () => {
    try {
      const data = await apiService.request('/admin/exchange-rate');
      setCurrentRate(data.rate);
      setLastUpdated(data.updated_at);
      setNewRate(data.rate);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const handleUpdateRate = async (e) => {
    e.preventDefault();
    
    if (!newRate || parseFloat(newRate) <= 0) {
      setMessage('Please enter a valid exchange rate');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const data = await apiService.request('/admin/exchange-rate', {
        method: 'PUT',
        body: JSON.stringify({ rate: parseFloat(newRate) })
      });
      
      setMessage('Exchange rate updated successfully!');
      setCurrentRate(parseFloat(newRate));
      setLastUpdated(new Date().toISOString());
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update exchange rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Exchange Rate Management</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Current Exchange Rate</p>
            <p className="text-3xl font-bold text-blue-600">
              ₦{currentRate ? currentRate.toLocaleString() : '---'} / $1
            </p>
          </div>
          {lastUpdated && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm text-gray-700">
                {new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleUpdateRate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Exchange Rate (NGN per 1 USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new rate (e.g., 1500)"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            This rate will be used throughout the system for all currency conversions
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating...' : 'Update Exchange Rate'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>This rate replaces the external API exchange rate</li>
          <li>All prices displayed to users will use this rate</li>
          <li>Changes take effect immediately across the system</li>
          <li>Update this rate regularly to reflect current market conditions</li>
        </ul>
      </div>
    </div>
  );
};

export default ExchangeRateManager;
