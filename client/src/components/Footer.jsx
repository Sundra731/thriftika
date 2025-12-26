import { FiFacebook, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-dark-500 via-dark-400 to-dark-600 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600 text-light-200 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-4">Thriftika</h3>
            <p className="text-light-400 dark:text-light-300 mb-6">
              Your trusted marketplace for safe thrift fashion shopping. 
              We protect buyers from scams and fraud, ensuring every purchase is secure.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-dark-700 hover:bg-primary-600 dark:hover:bg-primary-500 flex items-center justify-center text-light-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                aria-label="Facebook"
              >
                <FiFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-dark-700 hover:bg-primary-600 dark:hover:bg-primary-500 flex items-center justify-center text-light-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                aria-label="Twitter"
              >
                <FiTwitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-dark-700 hover:bg-primary-600 dark:hover:bg-primary-500 flex items-center justify-center text-light-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                aria-label="Instagram"
              >
                <FiInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-dark-700 hover:bg-primary-600 dark:hover:bg-primary-500 flex items-center justify-center text-light-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                aria-label="Email"
              >
                <FiMail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white dark:text-light-100 font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-light-400 dark:text-light-300 hover:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-light-400 dark:text-light-300 hover:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-light-400 dark:text-light-300 hover:text-accent-400 dark:hover:text-accent-300 transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-accent-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Report Scam
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white dark:text-light-100 font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-light-400 dark:text-light-300 hover:text-secondary-400 dark:hover:text-secondary-300 transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-secondary-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-light-400 dark:text-light-300 hover:text-secondary-400 dark:hover:text-secondary-300 transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-secondary-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Safety Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-light-400 dark:text-light-300 hover:text-secondary-400 dark:hover:text-secondary-300 transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-secondary-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-8 pt-8 text-center">
          <p className="text-light-400 dark:text-light-300 text-sm">&copy; {new Date().getFullYear()} Thriftika. All rights reserved.</p>
          <p className="mt-2 text-light-500 dark:text-light-400 text-sm">Built with <span className="text-accent-400">❤️</span> for safe thrift shopping in Kenya</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;






