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
          50: '#fef3f2',
          100: '#fde4e1',
          200: '#fbcec7',
          300: '#f8aba0',
          400: '#f37d6b',
          500: '#e85d4a',
          600: '#d63f2a',
          700: '#b33220',
          800: '#942d1e',
          900: '#7a2a1d',
        },
        secondary: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fbd8a5',
          300: '#f8be6d',
          400: '#f49c33',
          500: '#f17f0a',
          600: '#e26505',
          700: '#bb4d08',
          800: '#953e0e',
          900: '#78350f',
        },
        accent: {
          50: '#fdf4f4',
          100: '#fce8e8',
          200: '#f9d1d1',
          300: '#f4a9a9',
          400: '#ed7474',
          500: '#e04747',
          600: '#cd2a2a',
          700: '#ab2020',
          800: '#8e1f1f',
          900: '#761f1f',
        },
        light: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#eae3d7',
          300: '#d9cdb8',
          400: '#c4b29a',
          500: '#b0997f',
          600: '#9a8268',
          700: '#7f6a56',
          800: '#685749',
          900: '#574a3f',
        },
        dark: {
          50: '#2c241f',
          100: '#241d19',
          200: '#1f1915',
          300: '#1a1512',
          400: '#16120f',
          500: '#120f0d',
          600: '#0f0c0a',
          700: '#0c0a08',
          800: '#090706',
          900: '#060504',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}






