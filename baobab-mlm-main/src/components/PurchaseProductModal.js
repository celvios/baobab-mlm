import React, { useState } from 'react';
import { XMarkIcon as X, ChevronLeftIcon as ChevronLeft, ChevronRightIcon as ChevronRight, CheckCircleIcon } from '@heroicons/react/24/outline';
import { products as allProducts } from '../data/products';
import apiService from '../services/api';
import { useNotification } from './NotificationSystem';

const PurchaseProductModal = ({ isOpen, onClose, userProfile }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const { addNotification } = useNotification();

  const products = allProducts;
  const walletBalance = userProfile?.wallet?.balance || 0;

  const getCurrencyInfo = () => {
    const locale = navigator.language || 'en-US';
    const country = locale.split('-')[1] || 'US';
    
    const currencyMap = {
      'NG': { symbol: '₦', rate: 1500, code: 'NGN' },
      'US': { symbol: '$', rate: 1, code: 'USD' },
      'GB': { symbol: '£', rate: 0.8, code: 'GBP' },
      'CA': { symbol: 'C$', rate: 1.35, code: 'CAD' },
      'AU': { symbol: 'A$', rate: 1.5, code: 'AUD' },
      'ZA': { symbol: 'R', rate: 18, code: 'ZAR' },
      'KE': { symbol: 'KSh', rate: 150, code: 'KES' },
      'GH': { symbol: '₵', rate: 12, code: 'GHS' }
    };
    
    return currencyMap[country] || currencyMap['NG'];
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedProduct) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handlePurchase();
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    
    const currency = getCurrencyInfo();
    const productPriceLocal = (selectedProduct.basePrice || selectedProduct.price) * currency.rate;
    
    if (walletBalance < productPriceLocal) {
      addNotification('Insufficient wallet balance', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        productName: selectedProduct.name,
        productPrice: productPriceLocal,
        quantity: 1,
        deliveryType: 'pickup',
        pickupStation: 'Ikeja High Tower, Lagos'
      };
      
      const response = await apiService.purchaseWithWallet(orderData);
      const newOrderNumber = response.order?.orderNumber || `ORD${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Save to localStorage
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const newOrder = {
        id: Date.now(),
        orderNumber: newOrderNumber,
        date: new Date().toLocaleDateString('en-GB'),
        product: selectedProduct.name,
        quantity: 1,
        amount: productPriceLocal,
        status: 'confirmed',
        paymentStatus: 'successful',
        deliveryStatus: 'pending',
        deliveryType: 'pickup',
        transaction: 'Purchase',
        createdAt: new Date().toISOString()
      };
      
      userOrders.push(newOrder);
      localStorage.setItem('userOrders', JSON.stringify(userOrders));
      
      setOrderNumber(newOrderNumber);
      setOrderComplete(true);
      addNotification('Product purchased successfully!', 'success');
      
    } catch (error) {
      console.error('Purchase failed:', error);
      addNotification('Purchase failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedProduct(null);
    setLoading(false);
    setOrderComplete(false);
    setOrderNumber('');
    onClose();
  };



  if (!isOpen) return null;

  return (
    <>
      {true && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Purchase Product</h2>
            <p className="text-gray-600 mt-1">Please confirm whether you want to proceed with this action.</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900">Step {currentStep}/2</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {currentStep === 1 && 'Select Product'}
              {currentStep === 2 && 'Make Payment'}
            </span>
          </div>
          <div className="flex mt-3 space-x-2">
            <div className={`h-1 flex-1 rounded ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`h-1 flex-1 rounded ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        {/* Step 1: Select Product */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-bold text-center mb-8">Select Product</h3>
            
            <div className="relative">
              <div className="flex items-center justify-center overflow-hidden h-80">
                {products.map((product, index) => {
                  const position = index - currentIndex;
                  return (
                    <div
                      key={product.id}
                      className={`absolute w-80 p-4 rounded-xl border cursor-pointer transition-all duration-300 backdrop-blur-md bg-white/30 border-white/20 shadow-lg ${
                        selectedProduct?.id === product.id 
                          ? 'border-green-500/50 bg-green-50/40' 
                          : 'hover:border-green-300/50 hover:bg-white/40'
                      }`}
                      style={{
                        transform: `translateX(${position * 100}px)`,
                        zIndex: position === 0 ? 10 : 5 - Math.abs(position),
                        opacity: Math.abs(position) > 1 ? 0 : 1
                      }}
                      onClick={() => {
                        handleProductSelect(product);
                        setCurrentIndex(index);
                      }}
                    >
                      <div className={`bg-gradient-to-br ${product.bgColor} rounded-lg p-4 mb-4`}>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-32 object-contain rounded"
                        />
                      </div>
                      <h4 className="font-bold text-lg mb-2">{product.name}</h4>
                      <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                      <div className="text-center">
                        <span className="text-xl font-bold">${product.price.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button 
                onMouseEnter={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 z-30"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onMouseEnter={() => setCurrentIndex(Math.min(products.length - 1, currentIndex + 1))}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 z-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="font-medium mb-2">Proceed to make payment</p>
              <p className="text-gray-600 text-sm">All payments must be made manually</p>
            </div>
          </div>
        )}

        {/* Step 2: Confirm Purchase */}
        {currentStep === 2 && !orderComplete && (
          <div>
            <h3 className="text-xl font-bold text-center mb-8">Confirm Purchase</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-medium mb-4">Order Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{selectedProduct?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price (USD):</span>
                  <span className="font-medium">${(selectedProduct?.basePrice || selectedProduct?.price || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({getCurrencyInfo().code}):</span>
                  <span className="font-medium">{getCurrencyInfo().symbol}{((selectedProduct?.basePrice || selectedProduct?.price || 0) * getCurrencyInfo().rate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between border-t pt-3 font-semibold">
                  <span>Total ({getCurrencyInfo().code}):</span>
                  <span>{getCurrencyInfo().symbol}{((selectedProduct?.basePrice || selectedProduct?.price || 0) * getCurrencyInfo().rate).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Your Wallet Balance:</span>
                <span className="font-semibold text-lg">{getCurrencyInfo().symbol}{walletBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700">After Purchase:</span>
                <span className={`font-semibold ${walletBalance >= ((selectedProduct?.basePrice || selectedProduct?.price || 0) * getCurrencyInfo().rate) ? 'text-green-600' : 'text-red-600'}`}>
                  {getCurrencyInfo().symbol}{(walletBalance - ((selectedProduct?.basePrice || selectedProduct?.price || 0) * getCurrencyInfo().rate)).toLocaleString()}
                </span>
              </div>
            </div>

            {walletBalance < ((selectedProduct?.basePrice || selectedProduct?.price || 0) * getCurrencyInfo().rate) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">
                  Insufficient wallet balance. Please add funds to your wallet first.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order Complete */}
        {orderComplete && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Successful!</h3>
            <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">Order Number:</div>
              <div className="font-semibold text-lg">#{orderNumber}</div>
            </div>
            
            <p className="text-sm text-gray-500">You can track your order in the Orders section.</p>
          </div>
        )}



        {/* Footer Buttons */}
        {!orderComplete && (
          <div className="flex space-x-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-medium hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={(currentStep === 1 && !selectedProduct) || loading || (currentStep === 2 && walletBalance < ((selectedProduct?.basePrice || selectedProduct?.price || 0) * getCurrencyInfo().rate))}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                (currentStep === 1 && !selectedProduct) || loading || (currentStep === 2 && walletBalance < ((selectedProduct?.basePrice || selectedProduct?.price || 0) * getCurrencyInfo().rate))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loading ? 'Processing...' : currentStep === 1 ? 'Proceed' : 'Confirm Purchase'}
            </button>
          </div>
        )}
        
        {orderComplete && (
          <div className="mt-8">
            <button
              onClick={handleClose}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        )}
          </div>
        </div>
      )}
      

    </>
  );
};

export default PurchaseProductModal;