import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import CartDropdown from '../components/CartDropdown';
import PageLoader from '../components/PageLoader';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: ShoppingBagIcon },
  { name: 'My Orders', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'My Team', href: '/team', icon: UserGroupIcon },
  { name: 'History', href: '/history', icon: ClockIcon },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showTopAccountMenu, setShowTopAccountMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Use stored user data as fallback
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUserProfile({
        fullName: storedUser.fullName || 'User',
        email: storedUser.email || 'user@example.com',
        mlmLevel: storedUser.mlmLevel || 'no_stage'
      });
    }
  };

  const handleLogout = () => {
    // Use API service logout method
    apiService.logout();
    // Clear any stored data
    localStorage.clear();
    // Navigate to login
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
              <img src="/images/IMG_4996 2.png" alt="Logo" className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-white">Baobab</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-primary-600 text-white shadow-lg'
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
          <div className="flex h-16 items-center px-4 lg:px-6">
            <img src="/images/IMG_4996 2.png" alt="Logo" className="h-8 w-8 lg:h-10 lg:w-10 mr-2 lg:mr-3" />
            <h1 className="text-lg lg:text-xl font-bold text-white">Baobab</h1>
          </div>
          <nav className="flex-1 space-y-1 lg:space-y-2 px-2 lg:px-4 py-4 lg:py-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium rounded-lg lg:rounded-xl transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden lg:block">{item.name}</span>
              </Link>
            ))}
          </nav>
          
          {/* Account Profile */}
          <div className="p-4 border-t border-gray-700 relative">
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="w-full flex items-center space-x-3 hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">{userProfile?.fullName?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">{userProfile?.fullName || 'User'}</p>
                <p className="text-gray-400 text-xs">{userProfile?.email || 'user@example.com'}</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showAccountMenu && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
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
        <div className="sticky top-0 z-40 flex h-14 lg:h-16 bg-white/95 backdrop-blur-lg shadow-soft border-b border-gray-100">
          <button
            className="px-4 lg:px-6 text-gray-500 hover:text-gray-700 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-5 w-5 lg:h-6 lg:w-6" />
          </button>
          
          <div className="flex flex-1 justify-end items-center px-4 lg:px-6 space-x-2 lg:space-x-3">
            <div className="relative hidden sm:block">
              <button 
                onClick={() => setCartOpen(!cartOpen)}
                className="p-2 lg:p-3 text-gray-500 hover:text-primary-600 transition-all duration-200 rounded-lg lg:rounded-xl hover:bg-primary-50 relative"
              >
                <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
              <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} userProfile={userProfile} />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowTopAccountMenu(!showTopAccountMenu)}
                className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-xl transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{userProfile?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500">{userProfile?.mlmLevel === 'feeder' ? 'No Level' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'No Level'}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <span className="text-black font-bold text-sm">{userProfile?.fullName?.charAt(0) || 'U'}</span>
                </div>
              </button>
              

            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-3 sm:p-4 lg:p-8">
          <PageLoader>
            <Outlet />
          </PageLoader>
        </main>
      </div>
    </div>
  );
}