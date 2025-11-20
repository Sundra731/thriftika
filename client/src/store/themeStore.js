import { create } from 'zustand';

const useThemeStore = create((set) => ({
  isDarkMode: false,

  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return { isDarkMode: newMode };
    });
  },

  initializeTheme: () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      set({ isDarkMode: true });
    } else {
      document.documentElement.classList.remove('dark');
      set({ isDarkMode: false });
    }
  },
}));

export default useThemeStore;