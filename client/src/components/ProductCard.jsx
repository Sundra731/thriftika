import { Link } from 'react-router-dom';
import { FiShoppingBag, FiEye } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(price);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="card hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-700"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-lg mb-4 bg-light-200 dark:bg-dark-700 aspect-square">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiShoppingBag className="h-16 w-16 text-primary-300 dark:text-gray-500" />
          </div>
        )}
        {product.isSold && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Sold
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h3 className="font-semibold text-lg text-secondary-700 dark:text-light-100 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-secondary-600 dark:text-light-300 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(product.price)}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-secondary-600 dark:text-light-400 capitalize">{product.category}</span>
              <span className="text-xs text-secondary-500 dark:text-light-500">•</span>
              <span className="text-xs text-secondary-600 dark:text-light-400 capitalize">{product.condition}</span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        {product.seller && (
          <div className="mt-3 pt-3 border-t border-light-300 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-secondary-600 dark:text-light-400">Seller</p>
                <p className="text-sm font-medium text-secondary-700 dark:text-light-100">
                  {product.seller.name}
                </p>
              </div>
              {product.seller.isVerified && (
                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                  <span>✓</span>
                  <span>Verified</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Button */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
          <FiEye className="h-4 w-4" />
          <span className="text-sm font-medium">View Details</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;




