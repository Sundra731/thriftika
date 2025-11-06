import { useState, useEffect } from 'react';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import useToastStore from '../store/toastStore';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToastStore();

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const queryString = params.toString();
      const url = queryString ? `${API_ENDPOINTS.PRODUCTS.ALL}?${queryString}` : API_ENDPOINTS.PRODUCTS.ALL;
      
      const response = await api.get(url);
      setProducts(response.data.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch products';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch product';
      setError(message);
      showToast(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProduct,
  };
};

