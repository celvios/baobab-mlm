import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../../components/NotificationSystem';
import ProcessLoader from '../../components/ProcessLoader';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        email: formData.email,
        password: formData.password
      });

      // Store admin token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      
      addNotification('Admin login successful! Welcome back.', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
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
            Admin Portal
          </h2>
          <p className="text-center text-gray-600 mb-2">
            Sign in to admin dashboard
          </p>
          <div className="text-center text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <p className="font-medium text-amber-800">Demo Credentials:</p>
            <p className="text-amber-700">admin@baobabmlm.com</p>
            <p className="text-amber-700">Baobab2025@</p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 block w-full px-4 py-3 border rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                }`}
                placeholder="Enter admin email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`block w-full px-4 py-3 pr-12 border rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  }`}
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
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
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              'Sign in to Admin Portal'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}