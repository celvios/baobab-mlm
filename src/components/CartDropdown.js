import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCart } from '../contexts/CartContext';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import PaymentProcess from './PaymentProcess';

const CartDropdown = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [showPayment, setShowPayment] = useState(false);

  if (!isOpen) return null;

  return (
    <>
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
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Checkout clicked, cartItems:', cartItems.length, 'cartTotal:', cartTotal);
              setShowPayment(true);
              console.log('showPayment set to true');
            }}
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800"
          >
            Checkout
          </button>
        </div>
      )}
      </div>
      
      {showPayment && ReactDOM.createPortal(
        <PaymentProcess
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            onClose();
          }}
          product={{ name: 'Cart Items', price: cartTotal }}
          quantity={1}
        />,
        document.body
      )}
    </>
  );
};

export default CartDropdown;