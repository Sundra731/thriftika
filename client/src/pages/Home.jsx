import { Link } from 'react-router-dom';
import { FiShield, FiCheckCircle, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-light-50 to-secondary-50 dark:from-dark-800 dark:via-dark-900 dark:to-dark-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 dark:text-light-100 mb-6">
              Shop Thrift Fashion
              <span className="block text-primary-600 dark:text-primary-400">With Confidence</span>
            </h1>
            <p className="text-xl text-secondary-600 dark:text-light-300 mb-8 max-w-3xl mx-auto">
              Thriftika protects buyers from scams and fraud.
              Shop verified thrift sellers and enjoy safe, secure transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center space-x-2"
              >
                <span>Browse Products</span>
                <FiArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="btn-secondary text-lg px-8 py-3"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-light-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary-900 dark:text-light-100 mb-12">
            Why Choose Thriftika?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiShield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-light-100 mb-2">
                Buyer Protection
              </h3>
              <p className="text-secondary-600 dark:text-light-300">
                All sellers are verified before they can list products.
                Your purchases are protected from scams and fraud.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-light-100 mb-2">
                Verified Sellers
              </h3>
              <p className="text-secondary-600 dark:text-light-300">
                Every seller goes through a verification process.
                Shop with confidence knowing you're buying from trusted sellers.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 dark:bg-accent-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="h-8 w-8 text-secondary-600 dark:text-accent-300" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-light-100 mb-2">
                Quality Products
              </h3>
              <p className="text-secondary-600 dark:text-light-300">
                Browse through carefully curated thrift fashion items.
                Find unique pieces at great prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-secondary-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-light-100">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center space-x-2"
            >
              <span>View All</span>
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
              <p className="mt-4 text-secondary-600 dark:text-light-400">Loading products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiShoppingBag className="h-16 w-16 text-secondary-300 dark:text-dark-600 mx-auto mb-4" />
              <p className="text-secondary-600 dark:text-light-400">No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 dark:bg-primary-700 text-light-100 dark:text-light-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Shopping Safely?
          </h2>
          <p className="text-xl text-primary-100 dark:text-primary-200 mb-8 max-w-2xl mx-auto">
            Join thousands of buyers who trust Thriftika for safe thrift fashion shopping.
          </p>
          <Link
            to="/register"
            className="bg-light-50 dark:bg-dark-800 text-primary-600 dark:text-primary-400 hover:bg-light-200 dark:hover:bg-dark-700 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;




