import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiLogOut, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode, initializeTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-light-50 dark:bg-dark-900 shadow-lg dark:shadow-2xl border-b border-light-300 dark:border-dark-700 sticky top-0 z-50 backdrop-blur-sm bg-light-50/95 dark:bg-dark-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FiShoppingBag className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <span className="text-2xl font-bold text-secondary-700 dark:text-light-100">Thriftika</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-secondary-700 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-secondary-700 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium"
            >
              Products
            </Link>
            <Link
              to="/report"
              className="text-secondary-700 dark:text-light-200 hover:text-accent-600 dark:hover:text-accent-400 transition-all duration-200 font-medium"
            >
              Report Scam
            </Link>

            {user?.role === 'seller' && (
              <>
                <Link
                  to="/seller/dashboard"
                  className="text-secondary-700 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/verification"
                  className="text-secondary-700 dark:text-light-200 hover:text-secondary-600 dark:hover:text-secondary-400 transition-all duration-200 font-medium"
                >
                  Get Verified
                </Link>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-secondary-100 dark:hover:bg-gray-800 transition-all duration-200 border-2 border-transparent dark:border-yellow-500"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <FiSun className="h-5 w-5 text-yellow-500" /> : <FiMoon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
              <span className="ml-1 text-xs font-medium">{isDarkMode ? 'DARK' : 'LIGHT'}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-secondary-700 dark:text-light-200">
                  <FiUser className="h-5 w-5" />
                  <span className="font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-secondary-700 dark:text-light-200 hover:text-accent-600 dark:hover:text-accent-400 transition-all duration-200"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-secondary-700 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium"
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
            className="md:hidden p-2 rounded-lg text-steel-500 dark:text-linen-200 hover:bg-secondary-200 dark:hover:bg-steel-800 transition-all duration-200"
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
          <div className="md:hidden py-4 space-y-3 border-t border-light-300 dark:border-dark-700 bg-light-200 dark:bg-dark-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-secondary-700 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-light-300 dark:hover:bg-dark-700"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-secondary-700 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-light-300 dark:hover:bg-dark-700"
            >
              Products
            </Link>
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-secondary-700 dark:text-light-200 hover:text-accent-600 dark:hover:text-accent-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-light-300 dark:hover:bg-dark-700"
            >
              Report Scam
            </Link>
            {user?.role === 'seller' && (
              <>
                <Link
                  to="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-secondary-700 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-light-300 dark:hover:bg-dark-700"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/verification"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-secondary-700 dark:text-light-200 hover:text-secondary-600 dark:hover:text-secondary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-light-300 dark:hover:bg-dark-700"
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
              className="flex items-center space-x-2 w-full text-left text-steel-500 dark:text-linen-200 hover:bg-secondary-200 dark:hover:bg-steel-700 transition-all duration-200 font-medium py-2 px-3 rounded-lg"
            >
              {isDarkMode ? <FiSun className="h-5 w-5 text-yellow-500" /> : <FiMoon className="h-5 w-5 text-steel-400 dark:text-linen-300" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-secondary-700 dark:text-light-200 py-2 px-3">
                  <FiUser className="h-5 w-5" />
                  <span className="font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-left text-secondary-700 dark:text-light-200 hover:bg-light-300 dark:hover:bg-dark-700 transition-all duration-200 py-2 px-3 rounded-lg"
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
                  className="block text-secondary-700 dark:text-light-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 font-medium py-2 px-3 rounded-lg hover:bg-light-300 dark:hover:bg-dark-700"
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




