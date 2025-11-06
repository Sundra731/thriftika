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
      className="card hover:shadow-lg transition-shadow duration-300 group"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 aspect-square">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiShoppingBag className="h-16 w-16 text-gray-300" />
          </div>
        )}
        {product.isSold && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Sold
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500 capitalize">{product.category}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 capitalize">{product.condition}</span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        {product.seller && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Seller</p>
                <p className="text-sm font-medium text-gray-900">
                  {product.seller.name}
                </p>
              </div>
              {product.seller.isVerified && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Button */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-primary-600 group-hover:text-primary-700 transition-colors">
          <FiEye className="h-4 w-4" />
          <span className="text-sm font-medium">View Details</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

