import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiPackage, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

const SellerDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'seller') {
      showToast('Only sellers can access the dashboard', 'error');
      navigate('/');
      return;
    }

    fetchSellerProducts();
  }, [isAuthenticated, user, navigate]);

  const fetchSellerProducts = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.MY_PRODUCTS);
      const productsData = response.data.data;

      setProducts(productsData);

      // Calculate stats
      const activeProducts = productsData.filter(p => p.isAvailable && !p.isSold).length;
      const totalViews = productsData.reduce((sum, p) => sum + (p.views || 0), 0);

      setStats({
        totalProducts: productsData.length,
        activeProducts,
        totalViews,
        totalEarnings: 0, // This would need transaction data
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`${API_ENDPOINTS.PRODUCTS.ALL}/${productId}`);
      showToast('Product deleted successfully', 'success');
      fetchSellerProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600 dark:text-light-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-light-100 mb-2">
            Seller Dashboard
          </h1>
          <p className="text-secondary-600 dark:text-light-300">
            Manage your thrift products and track your sales
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900">
                <FiPackage className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-light-400">Total Products</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-light-100">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                <FiTrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-light-400">Active Products</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-light-100">{stats.activeProducts}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <FiEye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-light-400">Total Views</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-light-100">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <FiDollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-light-400">Earnings</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-light-100">{formatPrice(stats.totalEarnings)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Link
            to="/seller/add-product"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <FiPlus className="h-5 w-5" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-light-100">Your Products</h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="h-16 w-16 text-secondary-300 dark:text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-light-100 mb-2">
                No products yet
              </h3>
              <p className="text-secondary-600 dark:text-light-400 mb-6">
                Start selling by adding your first thrift product
              </p>
              <Link
                to="/seller/add-product"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <FiPlus className="h-5 w-5" />
                <span>Add Your First Product</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 dark:bg-dark-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-light-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-light-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-light-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-light-400 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-light-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-light-50 dark:bg-dark-800 divide-y divide-secondary-200 dark:divide-dark-700">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-light-100 dark:hover:bg-dark-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.images && product.images.length > 0 ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images[0]}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-secondary-200 dark:bg-dark-600 flex items-center justify-center">
                                <FiPackage className="h-6 w-6 text-secondary-400 dark:text-dark-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900 dark:text-light-100">
                              {product.name}
                            </div>
                            <div className="text-sm text-secondary-500 dark:text-light-400 capitalize">
                              {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-secondary-900 dark:text-light-100">
                          {formatPrice(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isSold
                            ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                            : product.isAvailable
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {product.isSold ? 'Sold' : product.isAvailable ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 dark:text-light-100">
                        {product.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/products/${product._id}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          >
                            <FiEye className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/seller/edit-product/${product._id}`}
                            className="text-secondary-600 dark:text-light-400 hover:text-secondary-900 dark:hover:text-light-300"
                          >
                            <FiEdit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;