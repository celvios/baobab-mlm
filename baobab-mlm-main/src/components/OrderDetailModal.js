import React, { useState } from 'react';
import { XMarkIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ReturnModal from './ReturnModal';

export default function OrderDetailModal({ order, isOpen, onClose }) {
  const [showReturnModal, setShowReturnModal] = useState(false);

  const handleReturnSubmit = (returnData) => {
    console.log('Return request:', returnData);
  };

  if (!isOpen || !order) return null;

  const statusConfig = {
    processing: { icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    shipped: { icon: TruckIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    delivered: { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100' },
    cancelled: { icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-100' }
  };

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{order.id}</h4>
                <p className="text-sm text-gray-600">Placed on {order.date}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">${item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tracking Information</h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">Tracking Number</p>
                      <p className="text-blue-700">{order.trackingNumber}</p>
                    </div>
                    <button className="btn-primary">Track Package</button>
                  </div>
                  {order.estimatedDelivery && (
                    <p className="text-sm text-blue-700 mt-2">
                      Estimated delivery: {order.estimatedDelivery}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(order.total - 5.99).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$5.99</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${order.total}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {order.status === 'delivered' && (
                <button 
                  onClick={() => setShowReturnModal(true)}
                  className="btn-secondary"
                >
                  Return Item
                </button>
              )}
              {order.status === 'processing' && (
                <button className="btn-secondary">Cancel Order</button>
              )}
              <button className="btn-primary">Contact Support</button>
            </div>
          </div>
        </div>
      </div>

      <ReturnModal
        order={order}
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onSubmit={handleReturnSubmit}
      />
    </div>
  );
}