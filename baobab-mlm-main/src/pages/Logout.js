import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Logout() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if this was an admin logout
    const wasAdmin = localStorage.getItem('adminToken') || localStorage.getItem('adminUser');
    setIsAdmin(!!wasAdmin);
    
    // Clear any remaining data
    localStorage.clear();
    
    const timer = setTimeout(() => {
      navigate(isAdmin ? '/admin/login' : '/login', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, isAdmin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Logged Out Successfully
          </h2>
          <p className="text-gray-600 mb-6">
            You have been successfully logged out of your Baobab account.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page in 3 seconds...
          </p>
          <button
            onClick={() => navigate(isAdmin ? '/admin/login' : '/login', { replace: true })}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    </div>
  );
}