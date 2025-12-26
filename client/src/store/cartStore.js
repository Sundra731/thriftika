import { create } from 'zustand';
import api from '../utils/api';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  itemCount: 0,

  // Helper function to update cart count
  updateCartCount: async () => {
    try {
      const response = await api.get('/cart/count');
      const count = response.data.count;
      set({ itemCount: count });
      return count;
    } catch (error) {
      console.error('Failed to update cart count:', error);
      return 0;
    }
  },

  // Fetch user's cart
  fetchCart: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/cart');
      const cart = response.data.data;
      set({
        cart,
        itemCount: cart.totalItems || 0,
        loading: false
      });
      return cart;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    set({ loading: true });
    try {
      const response = await api.post('/cart/add', { productId, quantity });
      const cart = response.data.data;
      const count = await get().updateCartCount();
      set({
        cart,
        itemCount: count,
        loading: false
      });
      return cart;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Update item quantity
  updateQuantity: async (productId, quantity) => {
    set({ loading: true });
    try {
      const response = await api.put('/cart/update', { productId, quantity });
      const cart = response.data.data;
      const count = await get().updateCartCount();
      set({
        cart,
        itemCount: count,
        loading: false
      });
      return cart;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    set({ loading: true });
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      const cart = response.data.data;
      const count = await get().updateCartCount();
      set({
        cart,
        itemCount: count,
        loading: false
      });
      return cart;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    set({ loading: true });
    try {
      const response = await api.delete('/cart/clear');
      const cart = response.data.data;
      set({
        cart,
        itemCount: 0,
        loading: false
      });
      return cart;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Get cart item count
  fetchCartCount: async () => {
    try {
      const response = await api.get('/cart/count');
      const count = response.data.count;
      set({ itemCount: count });
      return count;
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      return 0;
    }
  },

  // Reset cart (for logout, etc.)
  resetCart: () => {
    set({
      cart: null,
      loading: false,
      itemCount: 0
    });
  }
}));

export default useCartStore;