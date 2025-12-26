import { Link } from 'react-router-dom';
import { FiShield, FiCheckCircle, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Editorial Style */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background with organic shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-light-50 via-primary-50/30 to-secondary-50/20 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/20 dark:bg-primary-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200/20 dark:bg-secondary-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider px-4 py-2 bg-primary-100/50 dark:bg-primary-900/30 rounded-full">
                  Curated Thrift Fashion
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                <span className="block text-light-900 dark:text-light-50 mb-2">Discover</span>
                <span className="block bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 dark:from-primary-400 dark:via-secondary-400 dark:to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Pre-Loved Style
                </span>
                <span className="block text-light-800 dark:text-light-200 text-4xl md:text-5xl mt-2">With Trust</span>
              </h1>
              <p className="text-lg md:text-xl text-light-700 dark:text-light-300 leading-relaxed max-w-xl">
                A curated marketplace where every piece tells a story. Shop verified sellers, discover unique finds, and build your sustainable wardrobe.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Explore Collection</span>
                    <FiArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 font-semibold rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
                >
                  Join Community
                </Link>
              </div>
            </div>
            
            {/* Right side - Visual element */}
            <div className="hidden lg:block relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 dark:from-primary-600/30 dark:to-secondary-600/30 rounded-3xl rotate-6"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-secondary-400/20 to-primary-400/20 dark:from-secondary-600/30 dark:to-primary-600/30 rounded-3xl -rotate-6"></div>
                <div className="absolute inset-4 bg-light-50 dark:bg-dark-400 rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <FiShoppingBag className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-light-600 dark:text-light-400 font-medium">100% Verified Sellers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Asymmetric Layout */}
      <section className="py-24 bg-light-50 dark:bg-dark-400 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-100/30 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-4">
              Why Thriftika?
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-light-900 dark:text-light-50 mb-4">
              Shop Smart, <span className="bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">Shop Safe</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 - Left aligned */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              <div className="relative bg-light-50 dark:bg-dark-500 rounded-3xl p-8 h-full border border-light-200 dark:border-dark-600">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                  <FiShield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-light-900 dark:text-light-50 mb-3">
                  Protected
                </h3>
                <p className="text-light-700 dark:text-light-300 leading-relaxed">
                  Every transaction is secured. We verify all sellers before they can list, ensuring you shop with complete confidence.
                </p>
              </div>
            </div>

            {/* Feature 2 - Center, elevated */}
            <div className="group relative md:-mt-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-600 dark:to-dark-500 rounded-3xl p-8 h-full border-2 border-primary-200 dark:border-primary-700 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 dark:from-secondary-600 dark:to-secondary-700 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <FiCheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-light-900 dark:text-light-50 mb-3">
                  Verified
                </h3>
                <p className="text-light-700 dark:text-light-300 leading-relaxed">
                  Rigorous verification process for all sellers. Look for the verified badge to shop from trusted community members.
                </p>
              </div>
            </div>

            {/* Feature 3 - Right aligned */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              <div className="relative bg-light-50 dark:bg-dark-500 rounded-3xl p-8 h-full border border-light-200 dark:border-dark-600">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-primary-600 dark:to-secondary-600 flex items-center justify-center mb-6 transform group-hover:-rotate-6 transition-transform duration-300">
                  <FiShoppingBag className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-light-900 dark:text-light-50 mb-3">
                  Curated
                </h3>
                <p className="text-light-700 dark:text-light-300 leading-relaxed">
                  Handpicked pieces from fashion-forward sellers. Discover unique finds that reflect your personal style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - Editorial Style */}
      <section className="py-24 bg-gradient-to-b from-light-50 via-white to-light-50 dark:from-dark-400 dark:via-dark-500 dark:to-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Featured Collection
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-light-900 dark:text-light-50">
                Handpicked <span className="bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">Finds</span>
              </h2>
              <p className="text-light-600 dark:text-light-400 mt-2 max-w-md">
                Discover our curated selection of pre-loved fashion pieces
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold group self-start md:self-end"
            >
              <span>View All</span>
              <FiArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400"></div>
              <p className="mt-4 text-light-700 dark:text-light-400">Loading products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product._id} 
                  className={index === 1 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiShoppingBag className="h-16 w-16 text-light-400 dark:text-dark-600 mx-auto mb-4" />
              <p className="text-light-700 dark:text-light-400">No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Modern Style */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 dark:from-primary-700 dark:via-primary-800 dark:to-secondary-700"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="text-sm font-semibold text-primary-100 dark:text-primary-200 uppercase tracking-wider px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              Join the Community
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Start Your Sustainable<br />Fashion Journey
          </h2>
          <p className="text-xl text-primary-100 dark:text-primary-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of fashion lovers building sustainable wardrobes through trusted thrift shopping.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-10 py-4 bg-white dark:bg-light-50 text-primary-600 dark:text-primary-600 font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;






