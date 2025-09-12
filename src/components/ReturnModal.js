import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ReturnModal({ order, isOpen, onClose, onSubmit }) {
  const [returnData, setReturnData] = useState({
    items: [],
    reason: '',
    description: '',
    refundMethod: 'original'
  });

  const reasons = [
    'Defective item',
    'Wrong item received',
    'Item not as described',
    'Changed my mind',
    'Damaged during shipping',
    'Other'
  ];

  const handleItemToggle = (item) => {
    const isSelected = returnData.items.some(i => i.name === item.name);
    if (isSelected) {
      setReturnData({
        ...returnData,
        items: returnData.items.filter(i => i.name !== item.name)
      });
    } else {
      setReturnData({
        ...returnData,
        items: [...returnData.items, item]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(returnData);
    onClose();
  };

  if (!isOpen || !order) return null;

  const totalRefund = returnData.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Return Items</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Select items to return</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={returnData.items.some(i => i.name === item.name)}
                      onChange={() => handleItemToggle(item)}
                      className="mr-3"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">${item.price}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for return
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={returnData.reason}
                onChange={(e) => setReturnData({...returnData, reason: e.target.value})}
              >
                <option value="">Select a reason</option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Please provide more details about the issue..."
                value={returnData.description}
                onChange={(e) => setReturnData({...returnData, description: e.target.value})}
              />
            </div>

            {/* Refund Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="refundMethod"
                    value="original"
                    checked={returnData.refundMethod === 'original'}
                    onChange={(e) => setReturnData({...returnData, refundMethod: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-sm">Refund to original payment method</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="refundMethod"
                    value="store-credit"
                    checked={returnData.refundMethod === 'store-credit'}
                    onChange={(e) => setReturnData({...returnData, refundMethod: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-sm">Store credit (+10% bonus)</span>
                </label>
              </div>
            </div>

            {/* Summary */}
            {returnData.items.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total refund amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${returnData.refundMethod === 'store-credit' ? (totalRefund * 1.1).toFixed(2) : totalRefund.toFixed(2)}
                  </span>
                </div>
                {returnData.refundMethod === 'store-credit' && (
                  <p className="text-sm text-green-600 mt-1">Includes 10% store credit bonus</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={returnData.items.length === 0 || !returnData.reason}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Return Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}