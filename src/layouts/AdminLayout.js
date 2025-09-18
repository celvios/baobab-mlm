import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationSystem';
// Using fetch API instead of axios
import { 
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  GiftIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser');
    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch(`${API_BASE_URL}/admin/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      addNotification('Logged out successfully', 'success');
      navigate('/admin/login');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users Management', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Deposit Requests', href: '/admin/deposit-requests', icon: CurrencyDollarIcon },
    { name: 'Product Management', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Orders Management', href: '/admin/orders', icon: ClipboardDocumentListIcon },
    { name: 'Blog Management', href: '/admin/blog', icon: DocumentTextIcon },
    { name: 'Cashout Requests', href: '/admin/cashout', icon: CurrencyDollarIcon },
    { name: 'Emailer', href: '/admin/emailer', icon: SpeakerWaveIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-gray-900 text-white min-h-screen relative">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg font-semibold">baobab</span>
            </div>
          </div>
          
          <nav className="mt-6 pb-24">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white border-r-2 border-green-500'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-semibold">
                  {adminUser?.name ? adminUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{adminUser?.name || 'Admin User'}</div>
                <div className="text-xs text-gray-400">{adminUser?.email || 'admin@baobabmlm.com'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}