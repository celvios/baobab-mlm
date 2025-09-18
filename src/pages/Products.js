import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import PaymentProcess from '../components/PaymentProcess';
import MarketUpdates from '../components/MarketUpdates';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import { fetchProducts, getProductById } from '../data/products';

export default function Products() {
  const [currentView, setCurrentView] = useState('grid');
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
    setShowToast(true);
  };

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProducts();
      setAllProducts(products);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const products = Array.from({ length: 9 }, (_, i) => allProducts[i % allProducts.length]).filter(Boolean);
  const myProducts = allProducts.slice(0, 6);

  const benefits = [
    'Improves digestion & relieves acidity',
    'Supports heart health & blood pressure regulation',
    'Boosts immunity with antioxidant-rich herbs',
    'Enhances skin health & slows aging',
    'Aids weight management & detoxification',
    'Supports reproductive health for men & women'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <MarketUpdates />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  if (currentView === 'detail') {
    return (
      <div className="space-y-6">
        <MarketUpdates />

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setCurrentView('grid')}
                className="flex items-center bg-green-700 text-white px-4 py-2 rounded-lg mr-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </button>
              <span className="text-gray-600">All Products</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-gray-900 font-medium">Lentoc Tea</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Product Image */}
              <div className="bg-gradient-to-br from-pink-100 to-orange-100 rounded-2xl p-8 flex items-center justify-center border-l-4 border-gray-300">
                <img 
                  src="/images/IMG_4996 2.png" 
                  alt="Lentoc Tea" 
                  className="max-w-full h-auto"
                />
              </div>

              {/* Right Column: Product Details */}
              <div className="space-y-0">
                {/* Section 1: Product Name & Description (No Border) */}
                <div className="bg-white p-6 rounded-t-2xl">
                  <p className="text-gray-600 text-sm mb-2">Product Name</p>
                  <h1 className="text-3xl font-bold text-green-700 mb-4">Lentoc Tea</h1>
                  
                  <p className="text-gray-600 text-sm mb-2">Description</p>
                  <p className="text-gray-700">
                    A revitalizing herbal infusion blending powerful botanicals for total-body wellness.
                  </p>
                </div>

                {/* Section 2: Quantity, Price & Pickup (With Border) */}
                <div className="bg-gray-100 p-6 border-t border-gray-200">
                  <div className="mb-6">
                    <p className="text-gray-600 text-sm mb-3">Quantity</p>
                    <div className="flex items-center space-x-4 mb-6">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-600 text-sm mb-3">Price</p>
                    <div className="flex items-center space-x-4 mb-6">
                      <span className="text-3xl font-bold text-green-600">${products[0]?.price?.toLocaleString() || '3,000'}</span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(products[0], quantity)}
                      className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-2">Pick-Up Station</p>
                    <p className="font-medium mb-3">Ikeja High Tower, Lagos</p>
                    <button className="flex items-center text-sm hover:text-gray-700">
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">+</span>
                      </div>
                      Change Address
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Benefits (Bottom Section with Border) */}
            <div className="mt-6">
              <div className="bg-green-700 text-white px-6 py-3 rounded-t-2xl inline-block">
                <h3 className="font-bold text-white">Benefits</h3>
              </div>
              <div className="bg-gray-100 p-6 rounded-2xl rounded-tl-none border border-gray-200">
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-green-600 mr-3 text-lg">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Sidebar */}
          <div className="w-80">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Related Products</h3>
              <div className="space-y-4">
                {myProducts.map((product, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-600">{product.description.slice(0, 40)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm mb-1">${product.price.toLocaleString()}</p>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, 1);
                        }}
                        className="text-xs text-black cursor-pointer hover:text-gray-700 whitespace-nowrap"
                      >
                        Add to Cart
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MarketUpdates />

      <div className="flex gap-8">
        {/* Main Products Grid */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">All Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => setCurrentView('detail')}
              >
                <div className={`bg-gradient-to-br ${product.bgColor} p-6 flex items-center justify-center h-48`}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">${product.price.toLocaleString()}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product, 1);
                      }}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products Sidebar */}
        <div className="w-80">
          <h3 className="text-xl font-bold mb-6">Related Products</h3>
          
          <div className="space-y-4">
            {myProducts.map((product, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-600">{product.description.slice(0, 40)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm mb-1">${product.price.toLocaleString()}</p>
                  <p 
                    onClick={() => handleAddToCart(product, 1)}
                    className="text-xs text-black cursor-pointer hover:text-gray-700 whitespace-nowrap"
                  >
                    Add to Cart
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PaymentProcess
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        product={selectedProduct}
        quantity={quantity}
      />
      
      <Toast 
        message="Added to cart successfully!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}