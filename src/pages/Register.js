import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../components/NotificationSystem';
import ProcessLoader from '../components/ProcessLoader';
import apiService from '../services/api';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'NG',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeToTerms: false
  });

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      addNotification('Passwords do not match', 'error');
      return false;
    }
    if (formData.password.length < 6) {
      addNotification('Password must be at least 6 characters', 'error');
      return false;
    }
    if (!formData.agreeToTerms) {
      addNotification('Please agree to the terms and conditions', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log('Attempting registration with data:', {
        email: formData.email,
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        referredBy: formData.referralCode || null
      });
      
      const result = await apiService.register(formData);
      console.log('Registration successful:', result);
      
      if (result.requiresVerification) {
        addNotification('Registration successful! Please check your email for verification code.', 'success');
        setTimeout(() => {
          window.location.href = `/security-verification?email=${encodeURIComponent(formData.email)}`;
        }, 1500);
      } else {
        addNotification('Registration successful! You can now login.', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      addNotification(error.message || 'Registration failed', 'error');
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
            Join Baobab
          </h2>
          <p className="text-center text-gray-600 mb-2">
            Create your account to get started
          </p>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                id="country"
                name="country"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              >
                <option value="DZ">Algeria</option>
                <option value="AO">Angola</option>
                <option value="BJ">Benin</option>
                <option value="BW">Botswana</option>
                <option value="BF">Burkina Faso</option>
                <option value="BI">Burundi</option>
                <option value="CM">Cameroon</option>
                <option value="CV">Cape Verde</option>
                <option value="CF">Central African Republic</option>
                <option value="TD">Chad</option>
                <option value="KM">Comoros</option>
                <option value="CG">Congo</option>
                <option value="CD">DR Congo</option>
                <option value="DJ">Djibouti</option>
                <option value="EG">Egypt</option>
                <option value="GQ">Equatorial Guinea</option>
                <option value="ER">Eritrea</option>
                <option value="ET">Ethiopia</option>
                <option value="GA">Gabon</option>
                <option value="GM">Gambia</option>
                <option value="GH">Ghana</option>
                <option value="GN">Guinea</option>
                <option value="GW">Guinea-Bissau</option>
                <option value="CI">Ivory Coast</option>
                <option value="KE">Kenya</option>
                <option value="LS">Lesotho</option>
                <option value="LR">Liberia</option>
                <option value="LY">Libya</option>
                <option value="MG">Madagascar</option>
                <option value="MW">Malawi</option>
                <option value="ML">Mali</option>
                <option value="MR">Mauritania</option>
                <option value="MU">Mauritius</option>
                <option value="MA">Morocco</option>
                <option value="MZ">Mozambique</option>
                <option value="NA">Namibia</option>
                <option value="NE">Niger</option>
                <option value="NG">Nigeria</option>
                <option value="RW">Rwanda</option>
                <option value="ST">Sao Tome and Principe</option>
                <option value="SN">Senegal</option>
                <option value="SC">Seychelles</option>
                <option value="SL">Sierra Leone</option>
                <option value="SO">Somalia</option>
                <option value="ZA">South Africa</option>
                <option value="SS">South Sudan</option>
                <option value="SD">Sudan</option>
                <option value="SZ">Eswatini</option>
                <option value="TZ">Tanzania</option>
                <option value="TG">Togo</option>
                <option value="TN">Tunisia</option>
                <option value="UG">Uganda</option>
                <option value="ZM">Zambia</option>
                <option value="ZW">Zimbabwe</option>
              </select>
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
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">
              Referral Code (Optional)
            </label>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.referralCode}
              onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
              placeholder="Enter referral code"
            />
          </div>

          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">Terms and Conditions</a>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ProcessLoader size="sm" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}