import React, { useState } from 'react';
import { XMarkIcon, StarIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart, isFavorite, onToggleFavorite }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const images = [
    product.image,
    "/images/leaf-1.png",
    "/images/leaf-3.png"
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm hover:shadow-md"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Image Section - Strictly as per screenshot */}
            <div className="flex items-start justify-center">
              <div className="bg-pink-100 rounded-2xl p-6 w-full flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full flex items-center justify-center" style={{ minHeight: '340px' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-contain max-h-64 max-w-full"
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">
                  High-quality product with premium materials and excellent craftsmanship. 
                  Perfect for everyday use with modern design and functionality.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Specifications</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Premium quality materials</li>
                  <li>• 1 year warranty included</li>
                  <li>• Free shipping available</li>
                  <li>• 30-day return policy</li>
                </ul>
              </div>

              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  disabled={!product.inStock}
                  className="flex-1 btn-primary flex items-center justify-center"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>

              {!product.inStock && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">This item is currently out of stock.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}