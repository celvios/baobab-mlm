import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import PaymentReviewModal from './PaymentReviewModal';
import { products as allProducts } from '../data/products';

const PurchaseProductModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const products = allProducts;

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedProduct) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setShowReview(true);
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
    setShowReview(false);
    onClose();
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText('0012345678');
  };
  
  const isNewUser = JSON.parse(localStorage.getItem('userOrders') || '[]').length === 0;

  if (!isOpen) return null;

  return (
    <>
      {!showReview && (
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

        {/* Step 2: Make Payment */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-bold text-center mb-8">Make Payment</h3>
            
            <div className="text-center mb-8">
              <p className="text-lg">
                <span className="font-medium">Total Payment: ${selectedProduct ? (
                  selectedProduct.price + (JSON.parse(localStorage.getItem('userOrders') || '[]').length === 0 ? 9000 : 0)
                ).toLocaleString() : '18,000'}</span>
                <span className="text-gray-600">
                  {JSON.parse(localStorage.getItem('userOrders') || '[]').length === 0 ? ' (Product + Registration)' : ' (Product Only)'}
                </span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-center mb-6">MLM business Account Details</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <div className="bg-gray-200 rounded-lg p-3">
                    <span className="text-gray-700">Jaiz Microfinance Bank</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <div className="bg-gray-200 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-gray-700">0012345678</span>
                    <button 
                      onClick={copyAccountNumber}
                      className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
                    >
                      <Copy size={16} className="mr-1" />
                      Copy Now
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                  <div className="bg-gray-200 rounded-lg p-3">
                    <span className="text-gray-700">Baobab Export Solutions Limited</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="font-medium mb-2">Make Payments Now</p>
              <p className="text-gray-600 text-sm">Click "Payment Completed" to confirm your payment status</p>
            </div>
          </div>
        )}



        {/* Footer Buttons */}
        {currentStep <= 2 && (
          <div className="flex space-x-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-medium hover:bg-gray-500 transition-colors"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={currentStep === 1 && !selectedProduct}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1 && !selectedProduct
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {currentStep === 1 ? 'Proceed' : 'Payment Completed'}
            </button>
          </div>
        )}
          </div>
        </div>
      )}
      
      {showReview && (
        <PaymentReviewModal
          isOpen={showReview}
          onClose={() => {
            setShowReview(false);
            setCurrentStep(1);
            setSelectedProduct(null);
            onClose();
          }}
          product={selectedProduct}
          quantity={1}
        />
      )}
    </>
  );
};

export default PurchaseProductModal;