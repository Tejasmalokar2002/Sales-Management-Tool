import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function ProductTypes() {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/product-types');
      setProductTypes(response.data);
    } catch (error) {
      console.error('Error fetching product types:', error);
      setMessage({ type: 'error', text: 'Failed to load product types' });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await api.put(`/product-types/${editingType._id}`, formData);
        showMessage('success', 'Product type updated successfully!');
      } else {
        await api.post('/product-types', formData);
        showMessage('success', 'Product type created successfully!');
      }
      setShowForm(false);
      setEditingType(null);
      setFormData({ name: '', description: '' });
      fetchProductTypes();
    } catch (error) {
      console.error('Error saving product type:', error);
      const errorMsg = error.response?.data?.message || 'Error saving product type';
      showMessage('error', errorMsg);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || ''
    });
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (typeId) => {
    if (window.confirm('Are you sure you want to delete this product type? Products using this type might be affected.')) {
      try {
        await api.delete(`/product-types/${typeId}`);
        showMessage('success', 'Product type deleted successfully!');
        fetchProductTypes();
      } catch (error) {
        console.error('Error deleting product type:', error);
        const errorMsg = error.response?.data?.message || 'Error deleting product type';
        showMessage('error', errorMsg);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingType(null);
    setShowForm(false);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product Types</h1>
            <p className="text-gray-600">Manage product categories and classifications</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span> Add Product Type
            </button>
          )}
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">{message.type === 'success' ? '✅' : '⚠️'}</span>
              {message.text}
            </div>
          </div>
        )}

        {/* Add/Edit Product Type Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingType ? 'Edit Product Type' : 'Add New Product Type'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Electronics, Clothing, Grocery"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description for this product type"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingType ? 'Update' : 'Add'} Type
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productTypes.map((type) => (
            <div key={type._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{type.name}</h3>
                  <span className="text-xs text-gray-500">
                    Created: {new Date(type.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(type._id)}
                      className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              {type.description ? (
                <p className="text-gray-600 text-sm mb-4">{type.description}</p>
              ) : (
                <p className="text-gray-400 text-sm mb-4 italic">No description provided</p>
              )}

              {/* Product Count (if you want to show how many products use this type) */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>ID: {type._id.slice(-6)}</span>
                <span>Products: Coming soon</span>
              </div>
            </div>
          ))}
        </div>

        {productTypes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏷️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No product types found</h3>
            <p className="text-gray-600 mb-4">
              Product types help you organize and categorize your products
            </p>
            {user?.role === 'admin' ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Product Type
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Contact an administrator to create product types
              </p>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {productTypes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Types Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{productTypes.length}</div>
                <div className="text-sm text-gray-600">Total Types</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {productTypes.filter(type => type.description).length}
                </div>
                <div className="text-sm text-gray-600">With Description</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.ceil(productTypes.reduce((sum, type) => sum + type.name.length, 0) / productTypes.length)}
                </div>
                <div className="text-sm text-gray-600">Avg. Name Length</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ProductTypes;