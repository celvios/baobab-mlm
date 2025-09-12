import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import DeleteOrderModal from '../components/DeleteOrderModal';
import ViewOrderModal from '../components/ViewOrderModal';
import MarketUpdates from '../components/MarketUpdates';

export default function Orders() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [orders, setOrders] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Load orders from localStorage
    const loadOrders = () => {
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      setOrders(userOrders.reverse()); // Show newest first
    };
    
    loadOrders();
    
    // Listen for storage changes
    const handleStorageChange = () => loadOrders();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const mockOrders = [
    {
      id: 1,
      date: '01/01/25',
      orderNo: 'Ord39h9re...',
      product: 'Lentoc Tea',
      qty: '01',
      amount: '₦13,500',
      transaction: 'Purchased',
      deliveryType: 'Pick-Up Station',
      deliveryStatus: 'Pending',
      paymentStatus: 'Successful',
      pickupStation: 'Ikeja High Tower, Lagos'
    },
    {
      id: 2,
      date: '01/01/25',
      orderNo: 'Ord39h9re...',
      product: 'Lentoc Tea',
      qty: '01',
      amount: '₦13,500',
      transaction: 'Purchased',
      deliveryType: 'Pick-Up Station',
      deliveryStatus: 'Pending',
      paymentStatus: 'Successful',
      pickupStation: 'Ikeja High Tower, Lagos'
    },
    {
      id: 3,
      date: '01/01/25',
      orderNo: 'Ord39h9re...',
      product: 'Lentoc Tea',
      qty: '01',
      amount: '₦13,500',
      transaction: 'Purchased',
      deliveryType: 'Pick-Up Station',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Successful',
      pickupStation: 'Ikeja High Tower, Lagos'
    },
    {
      id: 4,
      date: '01/01/25',
      orderNo: 'Ord39h9re...',
      product: 'Lentoc Tea',
      qty: '01',
      amount: '₦13,500',
      transaction: 'Purchased',
      deliveryType: 'Pick-Up Station',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Successful',
      pickupStation: 'Ikeja High Tower, Lagos'
    },
    {
      id: 5,
      date: '01/01/25',
      orderNo: 'Ord39h9re...',
      product: 'Lentoc Tea',
      qty: '01',
      amount: '₦13,500',
      transaction: 'Purchased',
      deliveryType: 'Pick-up Station',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Successful',
      pickupStation: 'Ikeja High Tower, Lagos'
    },
    {
      id: 6,
      date: '01/01/25',
      orderNo: 'Ord39h9re...',
      product: 'Lentoc Tea',
      qty: '01',
      amount: '₦13,500',
      transaction: 'Purchased',
      deliveryType: 'Pick-Up Station',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Successful',
      pickupStation: 'Ikeja High Tower, Lagos'
    },
    {
      id: 7,
      date: '01/01/25',
      orderNo: 'Ord39h9re...',
      product: 'Lentoc Tea',
      qty: '01',
      amount: '₦13,500',
      transaction: 'Purchased',
      deliveryType: 'Pick-Up Station',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Successful',
      pickupStation: 'Ikeja High Tower, Lagos'
    },
    {
      id: 8,
      date: '01/01/25',
      orderNo: 'Ord39h9re...',
      product: 'Lentoc Tea',
      qty: '01',
      amount: '₦13,500',
      transaction: 'Purchased',
      deliveryType: 'Pick-Up Station',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Successful',
      pickupStation: 'Ikeja High Tower, Lagos'
    }
  ];

  // Use real orders if available, otherwise show mock data
  const displayOrders = orders.length > 0 ? orders.map(order => ({
    id: order.id,
    date: order.date,
    orderNo: order.orderNumber,
    product: order.product,
    qty: order.quantity.toString().padStart(2, '0'),
    amount: `₦${order.amount.toLocaleString()}`,
    transaction: order.transaction,
    deliveryType: order.deliveryType,
    deliveryStatus: order.status === 'pending' ? 'Pending' : 
                   order.status === 'approved' ? 'Processing' : 
                   order.status === 'delivered' ? 'Delivered' : 'Pending',
    paymentStatus: order.paymentStatus === 'pending' ? 'Pending' : 
                  order.paymentStatus === 'approved' ? 'Successful' : 'Pending',
    pickupStation: 'Ikeja High Tower, Lagos'
  })) : mockOrders;

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
    setActiveDropdown(null);
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const toggleDropdown = (orderId) => {
    setActiveDropdown(activeDropdown === orderId ? null : orderId);
  };

  const handleRowClick = (order, event) => {
    // Don't open modal if clicking on action button or dropdown
    if (event.target.closest('.action-button') || event.target.closest('.dropdown-menu')) {
      return;
    }
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      </div>

      <MarketUpdates />

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">History</h2>
            <div className="flex space-x-3">
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">
                Delete All
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                Sort By
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">#</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Order No.</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Product</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Qty</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Transaction</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Delivery type</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Delivery Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleRowClick(order, e)}
                >
                  <td className="py-4 px-6 text-sm">{order.id}</td>
                  <td className="py-4 px-6 text-sm">{order.date}</td>
                  <td className="py-4 px-6 text-sm">{order.orderNo}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg mr-3 flex items-center justify-center">
                        <img src="/images/IMG_4996 2.png" alt={order.product} className="w-8 h-8 rounded" />
                      </div>
                      <span className="text-sm font-medium">{order.product}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">{order.qty}</td>
                  <td className="py-4 px-6 text-sm font-semibold">{order.amount}</td>
                  <td className="py-4 px-6 text-sm">{order.transaction}</td>
                  <td className="py-4 px-6 text-sm">{order.deliveryType}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.deliveryStatus === 'Delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.deliveryStatus === 'Processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.deliveryStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 relative">
                    <button 
                      onClick={() => toggleDropdown(order.id)}
                      className="action-button text-gray-400 hover:text-gray-600 p-1"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeDropdown === order.id && (
                      <div ref={dropdownRef} className="dropdown-menu absolute right-6 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ViewOrderModal 
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        order={selectedOrder}
      />
      
      <DeleteOrderModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          console.log('Order deleted:', selectedOrder);
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
}