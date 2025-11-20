import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [],

  showToast: (message, type = 'success') => {
    const id = Date.now();
    const toast = { id, message, type };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export default useToastStore;




