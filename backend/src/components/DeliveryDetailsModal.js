import React, { useState } from 'react';
import { XMarkIcon, TruckIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function DeliveryDetailsModal({ isOpen, onClose, onConfirm }) {
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '123 Main Street, New York, NY 10001',
    timeSlot: 'morning',
    instructions: '',
    contactPhone: '+1 (555) 123-4567'
  });

  const timeSlots = [
    { id: 'morning', label: 'Morning (9AM - 12PM)', price: 0 },
    { id: 'afternoon', label: 'Afternoon (12PM - 5PM)', price: 0 },
    { id: 'evening', label: 'Evening (5PM - 8PM)', price: 5 },
    { id: 'express', label: 'Express (Same Day)', price: 15 }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(deliveryInfo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Delivery Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Delivery Address
              </label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={deliveryInfo.address}
                onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Delivery Time
              </label>
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <label key={slot.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="timeSlot"
                        value={slot.id}
                        checked={deliveryInfo.timeSlot === slot.id}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, timeSlot: e.target.value})}
                        className="mr-3"
                      />
                      <span className="text-sm">{slot.label}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {slot.price > 0 ? `+$${slot.price}` : 'Free'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={deliveryInfo.contactPhone}
                onChange={(e) => setDeliveryInfo({...deliveryInfo, contactPhone: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions (Optional)
              </label>
              <textarea
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Leave at door, ring bell, etc."
                value={deliveryInfo.instructions}
                onChange={(e) => setDeliveryInfo({...deliveryInfo, instructions: e.target.value})}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Estimated Delivery</p>
                  <p className="text-blue-700">2-3 business days</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Confirm Delivery
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}