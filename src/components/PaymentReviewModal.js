import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD${timestamp.slice(-6)}${random.toUpperCase()}`;
};

export default function PaymentReviewModal({ isOpen, onClose, product, quantity }) {
  const [orderNumber, setOrderNumber] = useState('');
  const { clearCart } = useCart();
  
  useEffect(() => {
    if (isOpen && !orderNumber) {
      clearCart();
      const newOrderNumber = generateOrderNumber();
      setOrderNumber(newOrderNumber);
      
      // Check if user is new (no previous orders)
      const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const isNewUser = existingOrders.length === 0;
      const registrationFee = isNewUser ? 9000 : 0;
      const productAmount = (product?.price || 9000) * (quantity || 1);
      const totalAmount = productAmount + registrationFee;
      
      // Create order in localStorage
      const newOrder = {
        id: Date.now(),
        orderNumber: newOrderNumber,
        date: new Date().toLocaleDateString('en-GB'),
        product: product?.name || 'Lentoc Tea',
        productId: product?.id,
        quantity: quantity || 1,
        productAmount: productAmount,
        registrationFee: registrationFee,
        amount: totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
        deliveryType: 'Pick-Up Station',
        transaction: 'Purchase',
        createdAt: new Date().toISOString()
      };
      
      existingOrders.push(newOrder);
      localStorage.setItem('userOrders', JSON.stringify(existingOrders));
      
      // Add order completion to market updates
      const marketUpdates = JSON.parse(localStorage.getItem('marketUpdates') || '[]');
      const orderUpdate = {
        id: Date.now() + 1,
        title: 'Order Placed Successfully!',
        message: `Your order #${newOrderNumber} for ${product?.name || 'Lentoc Tea'} has been placed and is under review`,
        type: 'info',
        date: new Date().toISOString(),
        isRead: false
      };
      marketUpdates.unshift(orderUpdate);
      localStorage.setItem('marketUpdates', JSON.stringify(marketUpdates));
    }
  }, [isOpen, product, quantity]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{zIndex: 999999, backgroundColor: 'rgba(0,0,0,0.7)'}}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-8" style={{zIndex: 1000000}}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Under Review</h2>
            <p className="text-gray-600">Your payment is being processed and will be reviewed shortly.</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{product?.name || 'Lentoc Tea'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product Amount:</span>
                <span className="font-medium">₦{((product?.price || 9000) * (quantity || 1)).toLocaleString()}</span>
              </div>
              {JSON.parse(localStorage.getItem('userOrders') || '[]').length === 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Fee:</span>
                  <span className="font-medium">₦9,000</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-gray-900">₦{(((product?.price || 9000) * (quantity || 1)) + (JSON.parse(localStorage.getItem('userOrders') || '[]').length === 0 ? 9000 : 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Order ID:</span>
                <span className="font-medium">#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending Approval</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">
              We'll notify you once your payment has been confirmed.
            </p>
            <p className="text-sm text-gray-500">
              This usually takes 5-10 minutes.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}