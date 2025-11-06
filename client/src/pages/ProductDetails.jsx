import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiShield, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import useToastStore from '../store/toastStore';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProduct, loading } = useProducts();
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useToastStore();
  const [product, setProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      const data = await fetchProduct(id);
      setProduct(data);
    };
    loadProduct();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(price);
  };

  const handleReportSeller = () => {
    if (!isAuthenticated) {
      showToast('Please login to report a seller', 'warning');
      navigate('/login');
      return;
    }
    navigate(`/report?seller=${product?.seller?._id}&product=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Product not found</p>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {product.images && product.images.length > 0 ? (
              <div>
                <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100">
                  <img
                    src={product.images[imageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImageIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 ${
                          imageIndex === idx ? 'border-primary-600' : 'border-gray-200'
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                <FiShoppingBag className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="capitalize">{product.category}</span>
                    <span>•</span>
                    <span className="capitalize">{product.condition} condition</span>
                    {product.size && (
                      <>
                        <span>•</span>
                        <span>Size: {product.size}</span>
                      </>
                    )}
                  </div>
                </div>
                {product.isSold && (
                  <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Sold
                  </span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-4xl font-bold text-primary-600 mb-2">
                  {formatPrice(product.price)}
                </p>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              {product.seller && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FiUser className="h-5 w-5" />
                    <span>Seller Information</span>
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{product.seller.name}</p>
                      {product.seller.isVerified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                          <FiShield className="h-3 w-3" />
                          <span>Verified Seller</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{product.seller.email}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!product.isSold && (
                  <button
                    disabled={!isAuthenticated || user?.role !== 'buyer'}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!isAuthenticated
                      ? 'Login to Purchase'
                      : user?.role !== 'buyer'
                      ? 'Only buyers can purchase'
                      : 'Purchase Now'}
                  </button>
                )}
                <button
                  onClick={handleReportSeller}
                  className="w-full btn-danger flex items-center justify-center space-x-2"
                >
                  <FiAlertTriangle className="h-5 w-5" />
                  <span>Report Seller</span>
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category</dt>
                  <dd className="font-medium text-gray-900 capitalize">{product.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Condition</dt>
                  <dd className="font-medium text-gray-900 capitalize">{product.condition}</dd>
                </div>
                {product.size && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Size</dt>
                    <dd className="font-medium text-gray-900">{product.size}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-600">Views</dt>
                  <dd className="font-medium text-gray-900">{product.views || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Listed</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

