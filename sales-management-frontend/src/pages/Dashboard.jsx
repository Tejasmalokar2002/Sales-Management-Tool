import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { MonthlySalesChart, RevenueTrendChart, ProductTypeChart } from '../components/Charts';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    todaysSalesRevenue: 0,
    monthlySales: { months: [], sales: [] },
    salesByProductType: [],
    revenueTrend: { days: [], revenue: [] },
    loading: true
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setDashboardData({
        ...response.data,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-invoice':
        navigate('/invoices');
        break;
      case 'add-customer':
        navigate('/customers');
        break;
      case 'add-product':
        if (user?.role === 'admin') {
          navigate('/products');
        } else {
          alert('Only administrators can add products');
        }
        break;
      case 'view-reports':
        alert('Reports feature coming soon!');
        break;
      default:
        break;
    }
  };

  // Calculate additional metrics
  const totalMonthlySales = dashboardData.monthlySales.sales.reduce((sum, sale) => sum + sale, 0);
  const averageDailyRevenue = dashboardData.revenueTrend.revenue.reduce((sum, rev) => sum + rev, 0) / 7;
  const topSellingCategory = dashboardData.salesByProductType.length > 0 
    ? dashboardData.salesByProductType.reduce((max, category) => 
        category.value > max.value ? category : max
      )
    : { name: 'N/A', value: 0 };

  if (dashboardData.loading) {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your sales management dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              📦
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              👥
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalCustomers}</p>
            </div>
          </div>
        </div>

        {/* Today's Sales Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              💰
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Today's Sales</h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹{dashboardData.todaysSalesRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Sales Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              📈
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Monthly Sales</h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalMonthlySales.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <MonthlySalesChart data={dashboardData.monthlySales} />
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <RevenueTrendChart data={dashboardData.revenueTrend} />
        </div>

        {/* Product Type Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <ProductTypeChart data={dashboardData.salesByProductType} />
        </div>
      </div>

      {/* Additional Metrics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => handleQuickAction('create-invoice')}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <span className="mr-2">🧾</span>
              Create Invoice
            </button>
            <button 
              onClick={() => handleQuickAction('add-customer')}
              className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <span className="mr-2">👥</span>
              Add Customer
            </button>
            <button 
              onClick={() => handleQuickAction('add-product')}
              className={`py-3 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center ${
                user?.role === 'admin' 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              disabled={user?.role !== 'admin'}
            >
              <span className="mr-2">📦</span>
              Add Product
            </button>
            <button 
              onClick={() => handleQuickAction('view-reports')}
              className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <span className="mr-2">📊</span>
              View Reports
            </button>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg. Daily Revenue</span>
              <span className="font-semibold text-blue-600">
                ₹{averageDailyRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Top Selling Category</span>
              <span className="font-semibold text-green-600">
                {topSellingCategory.name}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">Sales per Customer</span>
              <span className="font-semibold text-purple-600">
                ₹{dashboardData.totalCustomers > 0 ? (totalMonthlySales / dashboardData.totalCustomers).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-600">Product Diversity</span>
              <span className="font-semibold text-orange-600">
                {dashboardData.salesByProductType.length} Categories
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;