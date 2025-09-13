import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ProductManagement() {
  const [products] = useState([
    { id: 1, name: 'Lentoc Tea', category: 'Beverages', price: 13500, stock: 150, status: 'Active' },
    { id: 2, name: 'Face Powder', category: 'Cosmetics', price: 6000, stock: 89, status: 'Active' },
    { id: 3, name: 'Lip Gloss', category: 'Cosmetics', price: 12000, stock: 45, status: 'Active' },
    { id: 4, name: 'Organic Soap', category: 'Skincare', price: 6000, stock: 120, status: 'Active' }
  ]);

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Product Management</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Manage your MLM products, inventory, and pricing.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Products</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">152</div>
              <p className="text-gray-500 text-sm">152 Available Products</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Low Stock Items</h3>
              <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
              <p className="text-gray-500 text-sm">8 Items Need Restocking</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Categories</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">12</div>
              <p className="text-gray-500 text-sm">12 Product Categories</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Value</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">#2,450,000</div>
              <p className="text-gray-500 text-sm">Inventory Value</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product List</h3>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
            <div className="flex space-x-4">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>All Categories</option>
                <option>Beverages</option>
                <option>Cosmetics</option>
                <option>Skincare</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-orange-600 text-xs">🍃</span>
                        </div>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium">#{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}