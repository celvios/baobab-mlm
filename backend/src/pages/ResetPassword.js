import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reset password for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
        backgroundImage: 'url(/images/6241b2d41327941b39683db0_Peach%20Gradient%20Image%20(1)-p-800.png.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Background leaf decorations */}
        <img src="/images/leaf-1.png" alt="" className="absolute top-10 left-10 w-20 h-20 opacity-30 pointer-events-none" />
        <img src="/images/leaf-3.png" alt="" className="absolute top-20 right-16 w-24 h-24 opacity-25 pointer-events-none" />
        <img src="/images/leaf-1.png" alt="" className="absolute bottom-32 left-20 w-16 h-16 opacity-20 pointer-events-none" />
        <img src="/images/leaf-3.png" alt="" className="absolute bottom-20 right-10 w-28 h-28 opacity-35 pointer-events-none" />
        <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to {email}
            </p>
            <div className="mt-6">
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
      backgroundImage: 'url(/images/6241b2d41327941b39683db0_Peach%20Gradient%20Image%20(1)-p-800.png.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Background leaf decorations */}
      <img src="/images/leaf-1.png" alt="" className="absolute top-10 left-10 w-20 h-20 opacity-30 pointer-events-none" />
      <img src="/images/leaf-3.png" alt="" className="absolute top-20 right-16 w-24 h-24 opacity-25 pointer-events-none" />
      <img src="/images/leaf-1.png" alt="" className="absolute bottom-32 left-20 w-16 h-16 opacity-20 pointer-events-none" />
      <img src="/images/leaf-3.png" alt="" className="absolute bottom-20 right-10 w-28 h-28 opacity-35 pointer-events-none" />
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-elevated border border-white/20">
        <div>
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary-50 rounded-2xl">
              <img src="/images/IMG_4996 2.png" alt="Logo" className="h-12 w-12" />
            </div>
          </div>
          <Link to="/login" className="flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 mb-6 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full btn-primary">
            Send reset link
          </button>
        </form>
      </div>
    </div>
  );
}