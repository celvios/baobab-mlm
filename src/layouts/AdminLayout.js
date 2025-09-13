import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { 
  HomeIcon, 
  UsersIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: BanknotesIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      setUserProfile(profile);
      
      // Check if user is admin (you can modify this logic)
      if (!profile.isAdmin && profile.email !== 'admin@baobab.com') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      navigate('/login');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-900">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {adminNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-900">
          <div className="flex h-16 items-center px-6">
            <ShieldCheckIcon className="h-10 w-10 text-red-500 mr-3" />
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {adminNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Account Profile */}
          <div className="p-4 border-t border-gray-700 relative">
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="w-full flex items-center space-x-3 hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{userProfile?.fullName?.charAt(0) || 'A'}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">{userProfile?.fullName || 'Admin'}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showAccountMenu && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <Link
                  to="/dashboard"
                  className="w-full flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <HomeIcon className="w-4 h-4 mr-3" />
                  User Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 bg-white/95 backdrop-blur-lg shadow-soft border-b border-gray-100">
          <button
            className="px-6 text-gray-500 hover:text-gray-700 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-between items-center px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
              <p className="text-sm text-gray-500">Manage your MLM system</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                User View
              </Link>
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">{userProfile?.fullName?.charAt(0) || 'A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}