import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import apiService from '../services/api';
import { useNotification } from './NotificationSystem';

const generateOrderNumber = () => {
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD${random.toUpperCase()}`;
};

export default function PaymentReviewModal({ isOpen, onClose, product, quantity }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();
  const { addNotification } = useNotification();
  
  useEffect(() => {
    if (isOpen && !orderNumber) {
      createOrder();
    }
  }, [isOpen]);

  const createOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      clearCart();
      
      // Check if user is new (no previous orders)
      const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const isNewUser = existingOrders.length === 0;
      const registrationFee = isNewUser ? 9000 : 0;
      const productAmount = (product?.price || 9000) * (quantity || 1);
      const totalAmount = productAmount + registrationFee;
      
      const orderData = {
        productName: product?.name || 'Lentoc Tea',
        productPrice: product?.price || 9000,
        quantity: quantity || 1,
        deliveryType: 'pickup',
        pickupStation: 'Ikeja High Tower, Lagos'
      };
      
      const response = await apiService.createOrder(orderData);
      setOrderNumber(response.order.orderNumber);
      
      // Also save to localStorage as backup
      const newOrder = {
        id: response.order.id,
        orderNumber: response.order.orderNumber,
        date: new Date().toLocaleDateString('en-GB'),
        product: response.order.productName,
        productId: product?.id,
        quantity: response.order.quantity,
        productAmount: response.order.productPrice * response.order.quantity,
        registrationFee: registrationFee,
        amount: response.order.totalAmount,
        status: response.order.orderStatus,
        paymentStatus: response.order.paymentStatus,
        deliveryStatus: response.order.orderStatus,
        deliveryType: response.order.deliveryType,
        transaction: 'Purchase',
        createdAt: response.order.createdAt
      };
      
      existingOrders.push(newOrder);
      localStorage.setItem('userOrders', JSON.stringify(existingOrders));
      
      addNotification('Order placed successfully!', 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message);
      
      // Fallback to localStorage if API fails
      const newOrderNumber = generateOrderNumber();
      setOrderNumber(newOrderNumber);
      
      const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const isNewUser = existingOrders.length === 0;
      const registrationFee = isNewUser ? 9000 : 0;
      const productAmount = (product?.price || 9000) * (quantity || 1);
      const totalAmount = productAmount + registrationFee;
      
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
      
      addNotification('Order saved locally due to connection issue', 'warning');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Loading/Success/Error State */}
          <div className="text-center mb-6">
            {loading ? (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Order...</h2>
                <p className="text-gray-600">Please wait while we process your order.</p>
              </>
            ) : error ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Issue</h2>
                <p className="text-gray-600">{error}</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Under Review</h2>
                <p className="text-gray-600">Your payment is being processed and will be reviewed shortly.</p>
              </>
            )}
          </div>

          {/* Order Details */}
          {!loading && (
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
          )}

          {/* Status Message */}
          {!loading && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">
              {error ? 'Order saved locally. Please try again later.' : "We'll notify you once your payment has been confirmed."}
            </p>
            <p className="text-sm text-gray-500">
              {error ? 'Check your internet connection.' : 'This usually takes 5-10 minutes.'}
            </p>
          </div>
          )}

          {/* Action Button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
}