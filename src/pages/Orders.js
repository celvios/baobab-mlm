import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import DeleteOrderModal from '../components/DeleteOrderModal';
import ViewOrderModal from '../components/ViewOrderModal';
import MarketUpdates from '../components/MarketUpdates';
import apiService from '../services/api';
import { useNotification } from '../components/NotificationSystem';

export default function Orders() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const { addNotification } = useNotification();

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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Unable to connect to server. Showing local orders.');
      // Fallback to localStorage if API fails
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      setOrders(userOrders.reverse());
      if (userOrders.length === 0) {
        addNotification('No orders found. API connection failed.', 'warning');
      }
    } finally {
      setLoading(false);
    }
  };

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

  // Transform orders data for display
  const displayOrders = orders.length > 0 ? orders.map(order => ({
    id: order.id,
    date: new Date(order.createdAt).toLocaleDateString('en-GB'),
    orderNo: order.orderNumber,
    product: order.productName,
    qty: order.quantity.toString().padStart(2, '0'),
    amount: `₦${order.totalAmount.toLocaleString()}`,
    transaction: 'Purchased',
    deliveryType: order.deliveryType === 'pickup' ? 'Pick-Up Station' : 'Home Delivery',
    deliveryStatus: order.orderStatus === 'pending' ? 'Pending' : 
                   order.orderStatus === 'processing' ? 'Processing' : 
                   order.orderStatus === 'delivered' ? 'Delivered' : 'Pending',
    paymentStatus: order.paymentStatus === 'pending' ? 'Pending' : 
                  order.paymentStatus === 'successful' ? 'Successful' : 'Pending',
    pickupStation: order.pickupStation || 'Ikeja High Tower, Lagos',
    originalOrder: order
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

  const confirmDeleteOrder = async () => {
    if (!selectedOrder?.originalOrder?.id) {
      addNotification('Unable to delete order', 'error');
      return;
    }

    try {
      await apiService.deleteOrder(selectedOrder.originalOrder.id);
      addNotification('Order deleted successfully', 'success');
      fetchOrders(); // Refresh orders list
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      addNotification(error.message || 'Failed to delete order', 'error');
    }
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

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchOrders}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && (
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
      )}

      {/* Empty State */}
      {!loading && !error && displayOrders.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-4">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <a 
              href="/products"
              className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors inline-block"
            >
              Browse Products
            </a>
          </div>
        </div>
      )}

      {/* Modals */}
      <ViewOrderModal 
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        order={selectedOrder}
      />
      
      <DeleteOrderModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteOrder}
      />
    </div>
  );
}