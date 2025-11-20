# Thriftika 🛍️

**Buyer-First Thrift Fashion Marketplace** - A secure, modern platform where verified sellers can list thrift fashion items and buyers can shop with confidence through integrated M-Pesa payments.

![Thriftika](https://img.shields.io/badge/Thriftika-v1.0.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb)
![M-Pesa](https://img.shields.io/badge/M--Pesa-Integrated-00A6A6?style=flat-square)

## 🌟 Features

### For Buyers
- ✅ **Secure Shopping** - Verified sellers only
- ✅ **M-Pesa Integration** - Instant mobile payments
- ✅ **Buyer Protection** - Funds held until item confirmation
- ✅ **Product Reviews** - Rate and review purchases
- ✅ **Search & Filter** - Find items by category, price, condition
- ✅ **Dark Mode** - Modern UI with theme switching

### For Sellers
- ✅ **Easy Product Upload** - Drag & drop image upload
- ✅ **Seller Dashboard** - Track sales, earnings, and analytics
- ✅ **Verification System** - Build trust with buyer verification
- ✅ **Product Management** - Edit, delete, and track listings
- ✅ **Sales Analytics** - Monitor performance and trends

### Platform Features
- ✅ **Real-time Notifications** - Toast notifications for all actions
- ✅ **Responsive Design** - Works on all devices
- ✅ **Secure Authentication** - JWT-based auth with role management
- ✅ **Image Upload** - Cloud-ready file storage
- ✅ **Transaction History** - Complete purchase tracking

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Icons** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **M-Pesa Daraja API** - Mobile payment integration

### DevOps & Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development auto-restart
- **Git** - Version control

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **M-Pesa API Credentials** (from Safaricom Daraja Portal)
- **Git** (for version control)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Sundra731/thriftika.git
cd thriftika
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd server
npm install
```

#### Frontend Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend (.env)
Create `server/.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/thriftika

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# M-Pesa Daraja API Configuration
MPESA_ENV=sandbox  # Use 'production' for live
MPESA_CONSUMER_KEY=your-consumer-key-here
MPESA_CONSUMER_SECRET=your-consumer-secret-here
MPESA_SHORTCODE=your-shortcode-here
MPESA_PASSKEY=your-passkey-here
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/callback
```

### 4. Database Setup

#### Start MongoDB
```bash
# If using local MongoDB
mongod
```

#### Seed Sample Data
```bash
cd server
npm run seed
```

This creates:
- 3 sample verified sellers
- 8 sample thrift products
- Ready-to-use test data

### 5. Start the Application

#### Development Mode
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

#### Production Mode
```bash
# Backend
cd server
npm start

# Frontend (build and serve)
cd client
npm run build
npm run preview
```

### 6. Access the Application

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Documentation**: `http://localhost:5000/api`

## 📖 Usage Guide

### For Buyers

1. **Register/Login**
   - Create account with "Buy products" role
   - Login to access full features

2. **Browse Products**
   - Visit Products page
   - Use search and filters
   - View product details

3. **Make a Purchase**
   - Click "Purchase Now" on product
   - Enter M-Pesa phone number
   - Complete payment via STK Push
   - Funds held securely until confirmation

### For Sellers

1. **Register/Login**
   - Create account with "Sell products" role
   - Complete seller verification

2. **Upload Products**
   - Access "My Dashboard"
   - Click "Add New Product"
   - Upload images, set price, description
   - Product goes live immediately

3. **Manage Sales**
   - Track earnings and analytics
   - View transaction history
   - Manage product listings

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (sellers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Payments
- `POST /api/payments/initiate` - Initiate M-Pesa payment
- `GET /api/payments/status/:transactionId` - Check payment status
- `GET /api/payments/my-transactions` - Get user transactions

### Verification
- `POST /api/verify/submit` - Submit seller verification
- `GET /api/verify/status` - Check verification status

## 🎨 Color Palette

Thriftika uses an **Earthy Greens** color palette that perfectly matches the sustainable, eco-friendly nature of thrift shopping:

### Current Palette (Earthy Greens - Sustainable Theme)
- **Primary Green** `#4A7C59` - Forest green for trust and nature
- **Secondary Brown** `#8B4513` - Saddle brown for warmth and earthiness
- **Accent Cream** `#F5F5DC` - Beige/cream for sophistication

### Alternative Palettes Available

1. **Vintage Pastels** (Retro Theme)
   ```css
   --primary: #B19CD9;
   --secondary: #98D8C8;
   --accent: #F4C2C2;
   ```

2. **Eco-Friendly Greens** (Environmental Theme)
   ```css
   --primary: #2F4F4F;
   --secondary: #87A96B;
   --accent: #8B7355;
   ```

### Changing Colors
To switch palettes, update `client/tailwind.config.js` with your preferred colors. The design system automatically adapts to any palette you choose.

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Role-based Access** - Buyer/Seller permissions
- **Input Validation** - Comprehensive data validation
- **File Upload Security** - Type and size restrictions
- **M-Pesa Security** - Official API integration

## 🧪 Testing

### Sample Test Accounts

**Sellers:**
- Jane Fashion: `jane@example.com` / `password123`
- Mike Thrift: `mike@example.com` / `password123`
- Sarah Vintage: `sarah@example.com` / `password123`

**Create Buyer Account:**
- Register with "Buy products" role
- Use any email/password combination

### Testing M-Pesa Payments

1. **Sandbox Testing** (No real money)
   - Use sandbox API credentials
   - Test phone numbers: `254708374149`
   - Test amounts: KES 1-10

2. **Production Testing** (Real payments)
   - Get production API credentials
   - Use real M-Pesa numbers
   - Test with small amounts first

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Development Guidelines

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Test all new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Safaricom M-Pesa** - For the Daraja API
- **React Community** - For amazing tools and libraries
- **Open Source Contributors** - For the packages we use

## 📞 Support

For support, email support@thriftika.com or create an issue in this repository.

---

**Built with ❤️ for safe thrift shopping in Kenya and beyond**

⭐ Star this repo if you find it helpful!