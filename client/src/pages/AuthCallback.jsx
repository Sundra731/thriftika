import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (token && userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));

          // Store auth data
          setAuth(user, token);

          // Redirect to home
          navigate('/', { replace: true });
        } else {
          // Handle error
          console.error('Missing token or user data');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-light-50 to-secondary-50 dark:from-dark-800 dark:via-dark-900 dark:to-dark-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
              <FiLoader className="h-6 w-6 text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-secondary-900 dark:text-light-100">
              Signing you in...
            </h2>
            <p className="mt-2 text-secondary-600 dark:text-light-300">
              Please wait while we complete your authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;