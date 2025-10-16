import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [headerStats, setHeaderStats] = useState({
    todaysSales: 0,
    activeUsers: 0,
    loading: true
  });
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch header stats
  useEffect(() => {
    fetchHeaderStats();
  }, []);

  const fetchHeaderStats = async () => {
    try {
      const [dashboardRes, usersRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/auth/active-users') // We'll create this endpoint
      ]);
      
      setHeaderStats({
        todaysSales: dashboardRes.data.todaysSalesRevenue || 0,
        activeUsers: usersRes.data.activeUsers || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching header stats:', error);
      setHeaderStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics'
    },
    {
      path: '/customers',
      name: 'Customers',
      icon: '👥',
      description: 'Manage Clients'
    },
    {
      path: '/products',
      name: 'Products',
      icon: '📦',
      description: 'Inventory & Items'
    },
    {
      path: '/invoices',
      name: 'Invoices',
      icon: '🧾',
      description: 'Sales & Billing'
    },
    {
      path: '/profile',
      name: 'Profile',
      icon: '👤',
      description: 'Account Settings'
    },
    {
    path: '/product-types',
    name: 'Product Types',
    icon: '🏷️',
    description: 'Manage Categories'
  }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 to-purple-900 shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0 lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">SM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SalesPro</h1>
                <p className="text-blue-200 text-xs">Management System</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-blue-200 hover:text-white p-2 rounded-lg hover:bg-blue-800/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group relative
                  ${isActive(item.path)
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive(item.path) && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
                )}
                
                <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-blue-300/70 text-xs group-hover:text-blue-200/90 transition-colors">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-blue-700/30">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-3 text-blue-200 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">SalesPro</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">
                  {navigationItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 0-6 6v2.25l-2.47 2.47a.75.75 0 0 0 .53 1.28h15.88a.75.75 0 0 0 .53-1.28L16.5 12V9.75a6 6 0 0 0-6-6z" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-right">
                  <p className="text-gray-500 text-xs">Today's Sales</p>
                  {headerStats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                  ) : (
                    <p className="font-semibold text-green-600">
                      ₹{headerStats.todaysSales.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">Active Users</p>
                  {headerStats.loading ? (
                    <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                  ) : (
                    <p className="font-semibold text-blue-600">
                      {headerStats.activeUsers}
                    </p>
                  )}
                </div>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.name || user?.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <p className={`text-xs font-medium mt-1 ${
                            user?.role === 'admin' 
                              ? 'text-purple-600' 
                              : 'text-blue-600'
                          }`}>
                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Profile Settings</p>
                          <p className="text-xs text-gray-500">Manage your account</p>
                        </div>
                      </button>

                      <button className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors group">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Preferences</p>
                          <p className="text-xs text-gray-500">Customize settings</p>
                        </div>
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Sign Out</p>
                            <p className="text-xs text-red-500">Logout from your account</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {/* Background decorative elements */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl"></div>
          </div>

          {/* Content Container */}
          <div className="relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;