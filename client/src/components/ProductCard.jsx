import { Link } from 'react-router-dom';
import { FiShoppingBag, FiEye, FiShoppingCart } from 'react-icons/fi';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useToastStore from '../store/toastStore';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  const [addingToCart, setAddingToCart] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please sign in to add items to cart', 'error');
      return;
    }

    if (product.isSold || !product.isAvailable) {
      showToast('This item is not available', 'error');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product._id);
      showToast(`${product.name} added to cart!`, 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block relative"
    >
      {/* Card with unique styling */}
      <div className="relative bg-light-50 dark:bg-dark-500 rounded-2xl overflow-hidden border border-light-200 dark:border-dark-600 transition-all duration-500 hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-600">
        {/* Product Image */}
        <div className="relative overflow-hidden aspect-[4/5] bg-gradient-to-br from-light-200 to-light-300 dark:from-dark-600 dark:to-dark-700">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiShoppingBag className="h-16 w-16 text-primary-400 dark:text-dark-500" />
            </div>
          )}
          
          {/* Status badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isSold ? (
              <span className="bg-accent-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                Sold
              </span>
            ) : (
              <span className="bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                Available
              </span>
            )}
          </div>
          
          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.isSold || !product.isAvailable}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-full flex items-center space-x-2 font-semibold transition-colors disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="h-5 w-5" />
                <span>
                  {addingToCart ? 'Adding...' :
                   product.isSold ? 'Sold' :
                   !product.isAvailable ? 'Unavailable' :
                   'Add to Cart'}
                </span>
              </button>

              <div className="bg-white dark:bg-dark-700 px-6 py-3 rounded-full flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-semibold">
                <FiEye className="h-5 w-5" />
                <span>Quick View</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-light-900 dark:text-light-50 mb-1 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {product.name}
              </h3>
              <p className="text-light-600 dark:text-light-400 text-sm line-clamp-1 mb-3">
                {product.description}
              </p>
            </div>
          </div>
          
          {/* Price and Category */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-semibold text-light-500 dark:text-light-500 uppercase tracking-wide">
                {product.category}
              </span>
              <span className="text-xs text-light-600 dark:text-light-400 capitalize">
                {product.condition}
              </span>
            </div>
          </div>

          {/* Seller Info */}
          {product.seller && (
            <div className="pt-4 border-t border-light-200 dark:border-dark-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-light-500 dark:text-light-500 uppercase tracking-wide mb-1">
                    Seller
                  </p>
                  <p className="text-sm font-bold text-light-900 dark:text-light-50">
                    {product.seller.name}
                  </p>
                </div>
                {product.seller.isVerified && (
                  <div className="flex items-center space-x-1.5 bg-gradient-to-r from-secondary-500 to-secondary-600 dark:from-secondary-600 dark:to-secondary-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;






