import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiShield, FiAlertTriangle, FiArrowLeft, FiPhone, FiCreditCard } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { usePayment } from '../hooks/usePayment';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import useToastStore from '../store/toastStore';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProduct, loading } = useProducts();
  const { initiatePayment, loading: paymentLoading } = usePayment();
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useToastStore();
  const [product, setProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

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

  const handlePurchase = () => {
    if (!isAuthenticated) {
      showToast('Please login to purchase products', 'warning');
      navigate('/login');
      return;
    }

    if (user?.role !== 'buyer') {
      showToast('Only buyers can purchase products', 'error');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      showToast('Please enter your phone number', 'error');
      return;
    }

    const result = await initiatePayment(product._id, phoneNumber);

    if (result.success) {
      setPaymentInitiated(true);
      setTransactionId(result.data.transactionId);
      setShowPaymentModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <FiShoppingBag className="h-16 w-16 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">Product not found</p>
          <Link to="/products" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-4 inline-block transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="bg-light-50 dark:bg-dark-800 rounded-xl shadow-lg p-6">
            {product.images && product.images.length > 0 ? (
              <div>
                <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-slate-100 dark:bg-slate-700">
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
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          imageIndex === idx ? 'border-primary-600' : 'border-slate-200 dark:border-slate-600 hover:border-primary-400'
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <FiShoppingBag className="h-24 w-24 text-slate-300 dark:text-slate-500" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-light-50 dark:bg-dark-800 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
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
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Sold
                  </span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {formatPrice(product.price)}
                </p>
                <p className="text-slate-600 dark:text-slate-400">{product.description}</p>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              {product.seller && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-6">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                    <FiUser className="h-5 w-5" />
                    <span>Seller Information</span>
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{product.seller.name}</p>
                      {product.seller.isVerified && (
                        <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                          <FiShield className="h-3 w-3" />
                          <span>Verified Seller</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{product.seller.email}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!product.isSold && (
                  <button
                    onClick={handlePurchase}
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

                {paymentInitiated && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-200">
                      <FiCreditCard className="h-5 w-5" />
                      <span className="font-medium">Payment Initiated!</span>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                      Check your phone for the M-Pesa payment prompt. Transaction ID: {transactionId?.slice(-8)}
                    </p>
                  </div>
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
            <div className="bg-light-50 dark:bg-dark-800 rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Product Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Category</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100 capitalize">{product.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Condition</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100 capitalize">{product.condition}</dd>
                </div>
                {product.size && (
                  <div className="flex justify-between">
                    <dt className="text-slate-600 dark:text-slate-400">Size</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100">{product.size}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Views</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">{product.views || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Listed</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-50 dark:bg-dark-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
                <FiCreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-light-100">
                Complete Your Purchase
              </h3>
              <p className="mt-2 text-secondary-600 dark:text-light-300">
                Pay KES {formatPrice(product?.price)} for "{product?.name}"
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                  M-Pesa Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-secondary-400 dark:text-light-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712345678 or 254712345678"
                    className="input-field pl-10"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-secondary-500 dark:text-light-400">
                  Enter the phone number linked to your M-Pesa account
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={paymentLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>How it works:</strong> You'll receive an M-Pesa prompt on your phone.
                Enter your PIN to complete the payment. Funds are held securely until you confirm receipt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

