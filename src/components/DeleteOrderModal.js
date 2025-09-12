import React from 'react';
import { X } from 'lucide-react';

const DeleteOrderModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Delete Order</h2>
            <p className="text-gray-600 mt-1">Please confirm whether you want to proceed with this action.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Delete Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Trash can icon with colorful design */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              {/* Trash can body */}
              <rect x="20" y="30" width="40" height="35" rx="4" fill="#4ECDC4"/>
              {/* Trash can lid */}
              <rect x="15" y="25" width="50" height="8" rx="4" fill="#45B7B8"/>
              {/* Handle */}
              <rect x="30" y="20" width="20" height="4" rx="2" fill="#6C5CE7"/>
              {/* Vertical lines */}
              <rect x="30" y="35" width="2" height="20" fill="#2D3436"/>
              <rect x="39" y="35" width="2" height="20" fill="#2D3436"/>
              <rect x="48" y="35" width="2" height="20" fill="#2D3436"/>
              {/* Orange accent */}
              <rect x="25" y="28" width="30" height="3" fill="#FD79A8"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product Order?</h3>
          <p className="text-gray-600">Are you sure you want to delete this order?</p>
        </div>

        {/* Footer Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-medium hover:bg-gray-500 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;