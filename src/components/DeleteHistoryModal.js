import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DeleteHistoryModal = ({ isOpen, onClose, onConfirm, isDeleteAll = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delete History</h2>
            <p className="text-gray-600 text-sm mt-1">Please confirm whether you want to proceed with this action.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Trash Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24">
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="24" y="36" width="48" height="42" rx="5" fill="#22D3EE"/>
              <rect x="18" y="30" width="60" height="10" rx="5" fill="#3B82F6"/>
              <rect x="36" y="24" width="24" height="5" rx="2.5" fill="#059669"/>
              <rect x="30" y="34" width="36" height="4" fill="#F97316"/>
              <rect x="36" y="42" width="3" height="24" fill="#374151"/>
              <rect x="46.5" y="42" width="3" height="24" fill="#374151"/>
              <rect x="57" y="42" width="3" height="24" fill="#374151"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete History List?</h3>
          <p className="text-gray-600 text-sm">
            {isDeleteAll 
              ? 'Are you sure you want to delete all records?' 
              : 'Are you sure you want to delete this record?'
            }
          </p>
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

export default DeleteHistoryModal;