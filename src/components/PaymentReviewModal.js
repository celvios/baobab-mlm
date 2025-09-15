import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import apiService from '../services/api';
import { useNotification } from './NotificationSystem';

// Constants
const DEFAULT_PRODUCT_PRICE = 9000;
const DEFAULT_PRODUCT_NAME = 'Lentoc Tea';
const REGISTRATION_FEE = 9000;
const DEFAULT_PICKUP_STATION = 'Ikeja High Tower, Lagos';
const DELIVERY_TYPE = 'pickup';
const USER_ORDERS_KEY = 'userOrders';

const generateOrderNumber = () => {
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD${random.toUpperCase()}`;
};

const getStoredOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_ORDERS_KEY) || '[]');
  } catch (error) {
    console.error('Error parsing stored orders:', error);
    return [];
  }
};

const saveOrderToStorage = (orders) => {
  try {
    localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving orders to storage:', error);
  }
};

export default function PaymentReviewModal({ isOpen, onClose, product, quantity = 1 }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();
  const { addNotification } = useNotification();

  // Memoized calculations
  const existingOrders = useMemo(() => getStoredOrders(), [isOpen]);
  const isNewUser = useMemo(() => existingOrders.length === 0, [existingOrders]);
  const productPrice = product?.price || DEFAULT_PRODUCT_PRICE;
  const productName = product?.name || DEFAULT_PRODUCT_NAME;
  const productAmount = productPrice * quantity;
  const registrationFee = isNewUser ? REGISTRATION_FEE : 0;
  const totalAmount = productAmount + registrationFee;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOrderNumber('');
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const createOrderObject = useCallback((orderData, isApiResponse = false) => {
    if (isApiResponse) {
      return {
        id: orderData.id,
        orderNumber: orderData.orderNumber,
        date: new Date().toLocaleDateString('en-GB'),
        product: orderData.productName,
        productId: product?.id,
        quantity: orderData.quantity,
        productAmount: orderData.productPrice * orderData.quantity,
        registrationFee,
        amount: orderData.totalAmount,
        status: orderData.orderStatus,
        paymentStatus: orderData.paymentStatus,
        deliveryStatus: orderData.orderStatus,
        deliveryType: orderData.deliveryType,
        transaction: 'Purchase',
        createdAt: orderData.createdAt
      };
    }
    
    return {
      id: Date.now(),
      orderNumber: orderData.orderNumber,
      date: new Date().toLocaleDateString('en-GB'),
      product: productName,
      productId: product?.id,
      quantity,
      productAmount,
      registrationFee,
      amount: totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      deliveryType: DELIVERY_TYPE,
      transaction: 'Purchase',
      createdAt: new Date().toISOString()
    };
  }, [product, productName, quantity, productAmount, registrationFee, totalAmount]);

  const createOrder = useCallback(async () => {
    if (!product && !productName) {
      setError('Product information is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const orderData = {
        productName,
        productPrice,
        quantity,
        deliveryType: DELIVERY_TYPE,
        pickupStation: DEFAULT_PICKUP_STATION
      };
      
      const response = await apiService.createOrder(orderData);
      const newOrderNumber = response.order.orderNumber;
      setOrderNumber(newOrderNumber);
      
      // Save to localStorage as backup
      const newOrder = createOrderObject(response.order, true);
      const updatedOrders = [...existingOrders, newOrder];
      saveOrderToStorage(updatedOrders);
      
      clearCart();
      addNotification('Order placed successfully!', 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || 'Failed to create order');
      
      // Fallback to localStorage if API fails
      const newOrderNumber = generateOrderNumber();
      setOrderNumber(newOrderNumber);
      
      const newOrder = createOrderObject({ orderNumber: newOrderNumber });
      const updatedOrders = [...existingOrders, newOrder];
      saveOrderToStorage(updatedOrders);
      
      addNotification('Order saved locally due to connection issue', 'warning');
    } finally {
      setLoading(false);
    }
  }, [product, productName, productPrice, quantity, existingOrders, createOrderObject, clearCart, addNotification]);

  // Create order when modal opens
  useEffect(() => {
    if (isOpen && !orderNumber && !loading) {
      createOrder();
    }
  }, [isOpen, orderNumber, loading, createOrder]);

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
                <span className="font-medium">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product Amount:</span>
                <span className="font-medium">₦{productAmount.toLocaleString()}</span>
              </div>
              {isNewUser && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Fee:</span>
                  <span className="font-medium">₦{REGISTRATION_FEE.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-gray-900">₦{totalAmount.toLocaleString()}</span>
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
              {error ? 'Order saved locally. Please try again later.' : "We'll notify you once your payment has been approved."}
            </p>
            <p className="text-xs text-gray-500">
              {error ? 'Your order will be synced when connection is restored.' : 'You can track your order status in the Orders section.'}
            </p>
          </div>
          )}

          {/* Action Buttons */}
          {!loading && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            {error && (
              <button
                onClick={() => {
                  setError(null);
                  setOrderNumber('');
                  createOrder();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}n confirmed."}
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