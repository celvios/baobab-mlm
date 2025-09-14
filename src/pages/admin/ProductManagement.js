import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, CheckIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [actionType, setActionType] = useState('');
  const [productList, setProductList] = useState([]);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    inventory: '',
    image: null
  });

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        setProductList(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/products/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      inventory: product.stock_quantity?.toString() || '0',
      image: null
    });
    setShowEditModal(true);
    setShowDropdown(null);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
    setShowDropdown(null);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        await fetchStats();
        setShowDeleteModal(false);
        setActionType('delete');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          stock_quantity: parseInt(productData.inventory) || 0,
          category: 'general',
          status: 'active'
        })
      });
      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        await fetchStats();
        setShowCreateModal(false);
        setActionType('create');
        setShowSuccessModal(true);
        setProductData({ name: '', description: '', price: '', inventory: '', image: null });
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          stock_quantity: parseInt(productData.inventory) || selectedProduct.stock_quantity
        })
      });
      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        await fetchStats();
        setShowEditModal(false);
        setActionType('edit');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const resetProductData = () => {
    setProductData({ name: '', description: '', price: '', inventory: '', image: null });
  };

  const tabs = ['All', 'Available Products', 'Out-of-Stocks'];

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Product Management</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Product Management</h2>
          <p className="text-gray-600 text-sm mb-6">Add, update, and manage all products listings with detailed information.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Available Products</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{stats.totalProducts || 0}</div>
              <p className="text-gray-500 text-xs sm:text-sm">{stats.totalProducts || 0} Available Products</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Out of Stock</h3>
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">{stats.outOfStock || 0}</div>
              <p className="text-gray-500 text-xs sm:text-sm">{stats.outOfStock || 0} Out of Stock</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Sales</h3>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">₦{stats.totalSales?.toLocaleString() || '0'}</div>
              <p className="text-gray-500 text-xs sm:text-sm">₦{stats.totalSales?.toLocaleString() || '0'} Products Sales</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Orders</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{stats.totalOrders || 0}</div>
              <p className="text-gray-500 text-xs sm:text-sm">{stats.totalOrders || 0} All Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Products</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    resetProductData();
                    setShowCreateModal(true);
                  }}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center text-sm w-full sm:w-auto"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </button>
                <button className="bg-gray-100 text-gray-600 px-3 sm:px-4 py-2 rounded-lg text-sm w-full sm:w-auto">
                  Sort By
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 sm:gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {productList.map((product) => (
                <div key={product.id} className="bg-pink-50 rounded-lg p-3 sm:p-4 relative">
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <button 
                      onClick={() => setShowDropdown(showDropdown === product.id ? null : product.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <EllipsisVerticalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    
                    {showDropdown === product.id && (
                      <div className="absolute right-0 mt-2 w-28 sm:w-32 bg-white rounded-lg shadow-lg border z-20">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 flex items-center"
                        >
                          <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product)}
                          className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 flex items-center text-red-600"
                        >
                          <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3 sm:mb-4">
                    <div className="w-full h-24 sm:h-32 bg-white rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <div className="text-center px-2">
                        <div className="text-lg sm:text-2xl font-bold text-green-600">Lentoc</div>
                        <div className="text-xs sm:text-sm text-gray-600">Tea blend with natural ingredients</div>
                        <div className="text-xs text-gray-500">20 Pcs</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
                    <div className="text-base sm:text-lg font-bold text-gray-900">₦{product.price?.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Stock: {product.stock_quantity || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Product Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-6">Please confirm whether you want to proceed with this action.</p>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this product?</p>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Product</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Create new products for listing</p>
            
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Create New Product</h4>
                <p className="text-sm text-gray-600 mb-4">Product listing</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={productData.name}
                  onChange={(e) => setProductData({...productData, name: e.target.value})}
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                <textarea 
                  value={productData.description}
                  onChange={(e) => setProductData({...productData, description: e.target.value})}
                  placeholder="Enter product description"
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="number" 
                  value={productData.price}
                  onChange={(e) => setProductData({...productData, price: e.target.value})}
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Total Inventory</label>
                <input 
                  type="number" 
                  value={productData.inventory}
                  onChange={(e) => setProductData({...productData, inventory: e.target.value})}
                  placeholder="Enter inventory count"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <button type="button" className="text-blue-600 text-sm">Choose file to upload</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Update product information</p>
            
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={productData.name}
                  onChange={(e) => setProductData({...productData, name: e.target.value})}
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                <textarea 
                  value={productData.description}
                  onChange={(e) => setProductData({...productData, description: e.target.value})}
                  placeholder="Enter product description"
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="number" 
                  value={productData.price}
                  onChange={(e) => setProductData({...productData, price: e.target.value})}
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Total Inventory</label>
                <input 
                  type="number" 
                  value={productData.inventory}
                  onChange={(e) => setProductData({...productData, inventory: e.target.value})}
                  placeholder="Enter inventory count"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <button type="button" className="text-blue-600 text-sm">Choose file to upload</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {actionType === 'delete' ? 'Congratulations.' : 
               actionType === 'edit' ? 'Product Updated Successfully' :
               'Product purchased successfully'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionType === 'delete' 
                ? 'Your product has been deleted successfully. Please proceed to your dashboard.' 
                : actionType === 'edit'
                ? 'Your product has been updated successfully.'
                : 'Your product has been created successfully and is to sales record.'
              }
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-2 bg-gray-900 text-white rounded-lg text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}