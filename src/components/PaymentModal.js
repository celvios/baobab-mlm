import React from 'react';
import { XMarkIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../contexts/SettingsContext';

export default function PaymentModal({ isOpen, onClose, amount, productName }) {
  const { settings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
            <div className="flex justify-between text-sm">
              <span>{productName}</span>
              <span>₦{amount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Bank Transfer Details</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bank Name:</span>
                <span className="font-medium">{settings.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">{settings.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Name:</span>
                <span className="font-medium">{settings.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-green-600">₦{amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              Please transfer the exact amount and upload your payment receipt for verification.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
            Upload Receipt
          </button>
        </div>
      </div>
    </div>
  );
}