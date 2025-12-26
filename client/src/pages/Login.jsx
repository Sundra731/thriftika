import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import useToastStore from '../store/toastStore';
import useAuthStore from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const { showToast } = useToastStore();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', formData);

      if (response.data.data.requiresTwoFactor) {
        // 2FA required
        setTwoFactorData(response.data.data);
        showToast('Please enter your 2FA code to continue', 'info');
        return;
      }

      // Normal login success
      const { token, user } = response.data.data;
      setAuth(user, token);
      showToast('Login successful!', 'success');
      navigate('/');
    } catch (error) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setTwoFactorLoading(true);

    try {
      const response = await api.post('/auth/verify-2fa', {
        userId: twoFactorData.userId,
        code: twoFactorCode,
      });

      const { token, user } = response.data.data;
      setAuth(user, token);
      showToast('Login successful!', 'success');
      navigate('/');
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid 2FA code', 'error');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleSendTwoFactorCode = async () => {
    try {
      await api.post('/2fa/send-code', { userId: twoFactorData.userId });
      showToast('Verification code sent to your email', 'success');
    } catch (error) {
      showToast('Failed to send verification code', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 via-light-100 to-primary-50 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <FiShoppingBag className="h-10 w-10 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">Thriftika</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-light-900 dark:text-light-100">Sign in to your account</h2>
          <p className="mt-2 text-sm text-light-700 dark:text-light-300">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              create a new account
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="card">
          {!twoFactorData ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-800 dark:text-light-200 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-light-500 dark:text-light-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-800 dark:text-light-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-light-500 dark:text-light-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-light-300 dark:border-dark-600 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-light-800 dark:text-light-200">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-300 dark:border-secondary-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-light-50 dark:bg-dark-400 text-light-600 dark:text-light-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div className="mt-6">
              <button
                onClick={async () => {
                  try {
                    const apiUrl = import.meta.env.VITE_API_URL || '/api';
                    // Check if OAuth is available first
                    const response = await fetch(`${apiUrl}/auth/google`, {
                      method: 'GET',
                      redirect: 'manual'
                    });
                    
                    if (response.status === 503) {
                      // OAuth not configured
                      const data = await response.json();
                      showToast(
                        data.message || 'Google sign-in is not currently available. Please use email and password to sign in.',
                        'error'
                      );
                    } else if (response.status === 302 || response.status === 303 || response.status === 307 || response.status === 308) {
                      // OAuth is configured, redirect to Google
                      window.location.href = `${apiUrl}/auth/google`;
                    } else {
                      // Try to redirect anyway
                      window.location.href = `${apiUrl}/auth/google`;
                    }
                  } catch (error) {
                    showToast(
                      'Unable to connect to Google sign-in. Please use email and password to sign in.',
                      'error'
                    );
                    console.error('Google OAuth error:', error);
                  }
                }}
                className="w-full flex justify-center items-center px-4 py-2 border-2 border-light-300 dark:border-dark-700 rounded-xl shadow-sm bg-light-50 dark:bg-dark-400 text-light-800 dark:text-light-200 hover:bg-light-100 dark:hover:bg-dark-500 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>
          ) : (
            // 2FA Form
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {twoFactorData.twoFactorMethod === 'email'
                    ? 'Enter the verification code sent to your email'
                    : 'Enter your authenticator code'
                  }
                </p>
              </div>

              <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={twoFactorLoading || twoFactorCode.length !== 6}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {twoFactorLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorData(null);
                      setTwoFactorCode('');
                    }}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Back
                  </button>
                </div>

                {twoFactorData.twoFactorMethod === 'email' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendTwoFactorCode}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Resend code
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;






