import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import Toast from './Toast';

const CartDropdown = ({ isOpen, onClose, userProfile }) => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const walletBalance = Number(userProfile?.wallet?.balance) || 0;
  const canCheckout = walletBalance >= cartTotal;

  const handleCheckout = async () => {
    if (!canCheckout || loading) return;
    
    setLoading(true);
    try {
      // Process each cart item as a separate order
      for (const item of cartItems) {
        const orderData = {
          productName: item.name,
          productPrice: item.price,
          quantity: item.quantity,
          deliveryType: 'pickup',
          pickupStation: 'Ikeja High Tower, Lagos'
        };
        
        await apiService.purchaseWithWallet(orderData);
      }
      
      clearCart();
      setToastMessage('All items purchased successfully!');
      setShowToast(true);
      onClose();
      
    } catch (error) {
      console.error('Checkout failed:', error);
      setToastMessage('Checkout failed. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border z-50">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Shopping Cart</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Your cart is empty
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-gray-600 text-xs">{item.description}</p>
                  <p className="font-semibold text-sm">₦{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {cartItems.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">₦{cartTotal.toLocaleString()}</span>
          </div>
          <div className="mb-3 text-sm text-gray-600">
            <div>Wallet Balance: ₦{walletBalance.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Cart Total: ₦{cartTotal.toLocaleString()}</div>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={!canCheckout || loading}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
              canCheckout && !loading
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Processing...' : canCheckout ? 'Checkout' : 'Insufficient Balance'}
          </button>
        </div>
      )}
      </div>
      
      <Toast
        message={toastMessage}
        type={toastMessage.includes('success') ? 'success' : 'error'}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default CartDropdown;