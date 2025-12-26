import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiShoppingCart } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useCartStore from '../store/cartStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode, initializeTheme } = useThemeStore();
  const { itemCount, fetchCartCount } = useCartStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initializeTheme();
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [initializeTheme, isAuthenticated, fetchCartCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-light-50/80 dark:bg-dark-500/80 backdrop-blur-xl border-b border-light-200/50 dark:border-dark-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - More distinctive */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-primary-600 to-secondary-600 dark:from-primary-500 dark:to-secondary-500 p-2 rounded-xl transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <FiShoppingBag className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 dark:from-primary-400 dark:via-secondary-400 dark:to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto]">
                Thriftika
              </span>
              <p className="text-[10px] text-light-500 dark:text-light-500 uppercase tracking-widest font-semibold -mt-1">
                Curated Thrift
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/products"
              className="text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/report"
              className="text-light-800 dark:text-light-200 hover:text-accent-600 dark:hover:text-accent-400 transition-all duration-200 font-medium relative group"
            >
              Report Scam
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-600 dark:bg-accent-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/messages"
                  className="text-light-800 dark:text-light-200 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 font-medium relative group"
                >
                  Messages
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 dark:bg-green-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  to="/disputes"
                  className="text-light-800 dark:text-light-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 font-medium relative group"
                >
                  My Disputes
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 dark:bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </>
            )}

            {user?.role === 'seller' && (
              <>
                <Link
                  to="/seller/dashboard"
                  className="text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium relative group"
                >
                  My Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  to="/verification"
                  className="text-light-800 dark:text-light-200 hover:text-secondary-600 dark:hover:text-secondary-400 transition-all duration-200 font-medium relative group"
                >
                  Get Verified
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary-600 dark:bg-secondary-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="relative flex items-center justify-center w-14 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-dark-700 dark:to-dark-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 group"
              aria-label="Toggle dark mode"
            >
              <div className={`absolute flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-yellow-400 shadow-md transform transition-all duration-300 ease-in-out ${
                isDarkMode ? 'translate-x-3' : '-translate-x-3'
              }`}>
                {isDarkMode ? (
                  <FiSun className="h-4 w-4 text-yellow-600 animate-spin-slow" />
                ) : (
                  <FiMoon className="h-4 w-4 text-primary-600" />
                )}
              </div>
              <span className={`absolute text-xs font-bold transition-opacity duration-300 ${
                isDarkMode ? 'opacity-0' : 'opacity-100'
              } text-white`} style={{ left: '8px' }}>
                L
              </span>
              <span className={`absolute text-xs font-bold transition-opacity duration-300 ${
                isDarkMode ? 'opacity-100' : 'opacity-0'
              } text-white`} style={{ right: '8px' }}>
                D
              </span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative flex items-center space-x-2 text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium"
                >
                  <FiShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center space-x-2 text-light-800 dark:text-light-200">
                  <FiUser className="h-5 w-5" />
                  <span className="font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-light-800 dark:text-light-200 hover:text-accent-600 dark:hover:text-accent-400 transition-all duration-200 font-medium"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-light-800 dark:text-light-200 hover:bg-primary-50 dark:hover:bg-dark-600 transition-all duration-200"
          >
            {mobileMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-light-300 dark:border-dark-700 bg-light-50 dark:bg-dark-400">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-600"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-600"
            >
              Products
            </Link>
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-light-800 dark:text-light-200 hover:text-accent-600 dark:hover:text-accent-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-accent-50 dark:hover:bg-dark-600"
            >
              Report Scam
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-light-800 dark:text-light-200 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-dark-600"
                >
                  Messages
                </Link>
                <Link
                  to="/disputes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-light-800 dark:text-light-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-orange-50 dark:hover:bg-dark-600"
                >
                  My Disputes
                </Link>
              </>
            )}
            {user?.role === 'seller' && (
              <>
                <Link
                  to="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-600"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/verification"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-light-800 dark:text-light-200 hover:text-secondary-600 dark:hover:text-secondary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-600"
                >
                  Get Verified
                </Link>
              </>
            )}
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={() => {
                toggleDarkMode();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full text-left text-dark-700 dark:text-light-200 hover:bg-primary-50 dark:hover:bg-dark-700 transition-all duration-200 font-medium py-2 px-3 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                {isDarkMode ? <FiSun className="h-5 w-5 text-yellow-500" /> : <FiMoon className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <div className={`w-10 h-6 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-dark-600 dark:to-dark-500 transition-all duration-300 ${
                isDarkMode ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : ''
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-all duration-300 mt-1 ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </div>
            </button>
            {isAuthenticated ? (
              <>
                {/* Mobile Cart Link */}
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 w-full text-left text-light-800 dark:text-light-200 hover:bg-primary-50 dark:hover:bg-dark-600 transition-all duration-200 py-2 px-3 rounded-lg"
                >
                  <div className="relative">
                    <FiShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>
                  <span>Cart ({itemCount})</span>
                </Link>

                <div className="flex items-center space-x-2 text-light-800 dark:text-light-200 py-2 px-3">
                  <FiUser className="h-5 w-5" />
                  <span className="font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-left text-light-800 dark:text-light-200 hover:bg-accent-50 dark:hover:bg-dark-600 transition-all duration-200 py-2 px-3 rounded-lg"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-light-800 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block btn-primary text-center py-2 px-3 mx-3"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;






