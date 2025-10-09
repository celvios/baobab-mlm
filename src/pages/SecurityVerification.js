import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationSystem';
import ProcessLoader from '../components/ProcessLoader';
import apiService from '../services/api';

export default function SecurityVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    const pendingEmail = emailFromUrl || localStorage.getItem('pendingVerificationEmail');
    
    if (pendingEmail) {
      setEmail(pendingEmail);
      localStorage.setItem('pendingVerificationEmail', pendingEmail);
    } else {
      // If no email found, redirect to register
      navigate('/register');
    }
  }, [navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      addNotification('Please enter the complete 6-digit code', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await apiService.verifyOTP(email, otpCode);
      addNotification('Email verified successfully! You can now login.', 'success');
      
      // Clear pending email
      localStorage.removeItem('pendingVerificationEmail');
      
      // Redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      addNotification(error.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    
    try {
      await apiService.resendVerification(email);
      addNotification('Verification code sent successfully!', 'success');
    } catch (error) {
      addNotification(error.message || 'Failed to resend code', 'error');
    } finally {
      setResendLoading(false);
    }
  };

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
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-center text-gray-600 mb-4">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-center text-sm font-semibold text-primary-600 mb-6">
            {email}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter verification code
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ProcessLoader size="sm" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              ← Back to Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}