/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e5',
          200: '#bae6cf',
          300: '#87d4ab',
          400: '#4A7C59',
          500: '#4A7C59',
          600: '#3d633a',
          700: '#2d4a2c',
          800: '#1e331e',
          900: '#0f1a0f',
        },
        secondary: {
          50: '#fef7ed',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#8B4513',
          500: '#8B4513',
          600: '#92400e',
          700: '#78350f',
          800: '#5c2c0c',
          900: '#3f1a07',
        },
        accent: {
          50: '#fefcf5',
          100: '#fef9e6',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#F5F5DC',
          500: '#F5F5DC',
          600: '#e6e6c8',
          700: '#d4d4b4',
          800: '#b3b38f',
          900: '#8f8f6b',
        },
        light: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        dark: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}




