import React from 'react';
import { CheckCircleIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function OrderTracking({ order }) {
  const trackingSteps = [
    { id: 'confirmed', label: 'Order Confirmed', date: order.date, completed: true },
    { id: 'processing', label: 'Processing', date: order.date, completed: order.status !== 'processing' },
    { id: 'shipped', label: 'Shipped', date: order.status === 'shipped' || order.status === 'delivered' ? '2024-01-16' : null, completed: order.status === 'shipped' || order.status === 'delivered' },
    { id: 'delivered', label: 'Delivered', date: order.status === 'delivered' ? order.estimatedDelivery : null, completed: order.status === 'delivered' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Order Progress</h3>
      
      <div className="relative">
        {trackingSteps.map((step, index) => (
          <div key={step.id} className="relative flex items-center pb-8 last:pb-0">
            {index < trackingSteps.length - 1 && (
              <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                step.completed ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
            
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step.completed 
                ? 'bg-green-500 border-green-500' 
                : 'bg-white border-gray-300'
            }`}>
              {step.completed ? (
                <CheckCircleIcon className="w-5 h-5 text-white" />
              ) : (
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className={`font-medium ${
                  step.completed ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-sm text-gray-500">{step.date}</p>
                )}
              </div>
              
              {step.id === 'shipped' && step.completed && order.trackingNumber && (
                <p className="text-sm text-gray-600 mt-1">
                  Tracking: {order.trackingNumber}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {order.status === 'shipped' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="font-medium text-blue-900">Package in Transit</p>
              <p className="text-sm text-blue-700">
                Expected delivery: {order.estimatedDelivery}
              </p>
            </div>
          </div>
        </div>
      )}

      {order.status === 'delivered' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-900">Package Delivered</p>
              <p className="text-sm text-green-700">
                Delivered on {order.estimatedDelivery}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}