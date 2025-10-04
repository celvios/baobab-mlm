import React from 'react';
import { XMarkIcon as X } from '@heroicons/react/24/outline';

const ViewOrderModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Order</h2>
            <p className="text-gray-600 mt-1">Track your product orders and delivery status</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Product Display */}
        <div className="text-center mb-8">
          <div className="w-32 h-24 bg-pink-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/images/IMG_4996 2.png" 
              alt={order.product}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          
          <div className="space-y-1">
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Product Name:</span> 
              <span className="text-green-600 font-semibold ml-1">{order.product}</span>
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Quantity:</span> 
              <span className="font-bold ml-1">{order.qty}</span>
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Price</span> 
              <span className="font-bold ml-1">{order.amount}</span>
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium">{order.orderNo}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Order Date:</span>
            <span className="font-medium">{order.date}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Payment Status:</span>
            <span className="font-medium">{order.paymentStatus}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Delivery Type:</span>
            <span className="font-medium">{order.deliveryType}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Pick-Up Station:</span>
            <span className="font-medium">{order.pickupStation}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Delivery Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.deliveryStatus === 'Delivered' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {order.deliveryStatus}
            </span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-medium hover:bg-gray-500 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;