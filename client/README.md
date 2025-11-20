# Thriftika Frontend

A modern, buyer-first thrift fashion marketplace frontend built with React, Vite, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - The app will be available at `http://localhost:5173`
   - Make sure your backend server is running on `http://localhost:5000`

## 📁 Project Structure

```
client/
├── src/
│   ├── assets/           # Images, logos, icons
│   ├── components/       # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   └── Toast.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── ReportSeller.jsx
│   │   └── NotFound.jsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useProducts.js
│   ├── store/           # Zustand state management
│   │   ├── authStore.js
│   │   └── toastStore.js
│   ├── utils/           # Utility functions
│   │   ├── api.js
│   │   └── constants.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Authentication**: Secure login/register with JWT tokens
- **Product Browsing**: Browse and search through verified thrift products
- **Product Details**: View detailed product information and seller details
- **Scam Reporting**: Report suspicious sellers or fraudulent activity
- **Toast Notifications**: User-friendly success/error messages
- **Mobile Responsive**: Works seamlessly on all device sizes

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `client` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

If not set, it defaults to `http://localhost:5000/api`.

## 📦 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🧪 Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **Zustand**: Lightweight state management
- **React Icons**: Icon library
- **Headless UI**: Accessible UI components

## 🎯 Key Features

1. **Buyer Protection Focus**: Easy access to report sellers
2. **Verified Seller Badges**: Clear indication of verified sellers
3. **Responsive Design**: Mobile-first approach
4. **Toast Notifications**: Real-time feedback for user actions
5. **Protected Routes**: Authentication-based route protection

## 🔐 Authentication

- Tokens are stored in localStorage
- Automatic token refresh on API calls
- Protected routes redirect to login if not authenticated

## 📝 Notes

- The frontend connects to the backend API at `http://localhost:5000/api`
- All API requests include JWT tokens in the Authorization header
- Toast notifications automatically disappear after 5 seconds
- The app is optimized for mobile devices with a responsive layout




