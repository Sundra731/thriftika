import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <FiShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center justify-center space-x-2">
            <FiHome className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
          <Link to="/products" className="btn-secondary inline-flex items-center justify-center space-x-2">
            <FiShoppingBag className="h-5 w-5" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;






