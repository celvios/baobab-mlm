import React, { useState } from 'react';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import Toast from './Toast';

export default function PaymentUploadModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('18000');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
    } else {
      setToastMessage('Please select an image file');
      setShowToast(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setToastMessage('Please select a payment proof image');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', file);
      formData.append('amount', amount);

      await apiService.uploadPaymentProof(formData);
      setToastMessage('Payment proof uploaded successfully! Awaiting admin confirmation.');
      setShowToast(true);
      onSuccess?.();
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setToastMessage('Failed to upload payment proof');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Upload Payment Proof</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Bank Details</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Bank:</strong> First Bank</p>
                <p><strong>Account Name:</strong> Baobab MLM Ltd</p>
                <p><strong>Account Number:</strong> 1234567890</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid (₦)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Proof (Image)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="payment-proof"
                />
                <label
                  htmlFor="payment-proof"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Click to upload payment receipt
                </label>
                {file && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Proof'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toast
        message={toastMessage}
        type={toastMessage.includes('success') ? 'success' : 'error'}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}