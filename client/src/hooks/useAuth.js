import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setAuth, logout, initializeAuth, user, isAuthenticated } = useAuthStore();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, formData);
      const { user, token } = response.data.data;
      setAuth(user, token);
      showToast('Registration successful!', 'success');
      navigate('/');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const { user, token } = response.data.data;
      setAuth(user, token);
      showToast('Login successful!', 'success');
      navigate('/');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      showToast('Password reset link sent to your email!', 'success');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      showToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  return {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    forgotPassword,
    logout: logoutUser,
  };
};




