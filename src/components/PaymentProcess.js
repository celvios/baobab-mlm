import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PaymentReviewModal from './PaymentReviewModal';

export default function PaymentProcess({ isOpen, onClose, product, quantity }) {
  const [copied, setCopied] = useState(false);
  const [showReview, setShowReview] = useState(false);

  if (!isOpen) return null;

  const copyAccountNumber = () => {
    navigator.clipboard.writeText('0012345678');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentCompleted = () => {
    setShowReview(true);
  };

  const handleReviewClose = () => {
    setShowReview(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-8" style={{zIndex: 10000}}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Product</h2>
            <p className="text-gray-600">Please confirm whether you want to proceed with this action.</p>
          </div>

          {/* Payment Section */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Make Payment</h3>
            <p className="text-lg font-medium text-gray-700 mb-6">
              Total Payment: ₦{(product?.price * quantity || 9000).toLocaleString()} ( Products )
            </p>
          </div>

          {/* Bank Details */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">MLM business Account Details</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="text-gray-900">Jaiz Microfinance Bank</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-gray-900">0012345678</span>
                  <button
                    onClick={copyAccountNumber}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {copied ? 'Copied!' : 'Copy Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <h4 className="font-medium text-gray-900 mb-2">Make Payments Now</h4>
            <p className="text-sm text-gray-600">
              Click "Payment Completed" to confirm your payment status
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handlePaymentCompleted}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Payment Completed
            </button>
          </div>
        </div>
      </div>
      
      {showReview && ReactDOM.createPortal(
        <PaymentReviewModal
          isOpen={showReview}
          onClose={handleReviewClose}
          product={product}
          quantity={quantity}
        />,
        document.body
      )}
    </div>
  );
}