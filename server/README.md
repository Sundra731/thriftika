# Thriftika Backend API

A secure, buyer-first thrift fashion marketplace backend built with Node.js, Express, and MongoDB.

## 🎯 Overview

Thriftika protects buyers from theft, fraud, and scams when purchasing secondhand clothing online. The backend provides:

- Secure user authentication (JWT-based)
- Verified seller onboarding
- Product listing and browsing
- Transaction safety (escrow-ready system)
- Scam reporting and moderation
- Buyer protection features

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the server directory:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     MONGO_URI=mongodb://localhost:27017/thriftika
     JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
     PORT=5000
     ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   Or start in production mode:
   ```bash
   npm start
   ```

5. **Verify the server is running**:
   - Visit `http://localhost:5000/api`
   - You should see: `{ "message": "Welcome to Thriftika API 🚀" }`

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── productController.js  # Product CRUD operations
│   ├── transactionController.js  # Transaction management
│   ├── verificationController.js  # Seller verification
│   └── reportController.js   # Scam reporting
├── middleware/
│   ├── authMiddleware.js     # JWT authentication
│   ├── errorMiddleware.js    # Global error handler
│   └── verifySellerMiddleware.js  # Seller verification check
├── models/
│   ├── User.js               # User schema (buyer/seller)
│   ├── Product.js            # Product schema
│   ├── Transaction.js        # Transaction schema
│   ├── Verification.js       # Seller verification schema
│   └── Report.js             # Scam report schema
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── productRoutes.js      # Product endpoints
│   ├── transactionRoutes.js  # Transaction endpoints
│   ├── verificationRoutes.js # Verification endpoints
│   └── reportRoutes.js       # Report endpoints
├── utils/
│   ├── tokenUtils.js         # JWT helpers
│   └── emailUtils.js         # Email utilities (placeholder)
├── server.js                 # Main entry point
├── .env.example              # Environment variables template
└── package.json              # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user (buyer or seller)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/test` - Test route

### Products (`/api/products`)

- `GET /api/products` - Get all available products (public)
- `GET /api/products/:id` - Get single product (public)
- `POST /api/products` - Create product (seller, verified)
- `PUT /api/products/:id` - Update product (seller, owner)
- `DELETE /api/products/:id` - Delete product (seller, owner)
- `GET /api/products/seller/my-products` - Get seller's products
- `GET /api/products/test` - Test route

### Transactions (`/api/transactions`)

- `POST /api/transactions` - Create transaction (buyer)
- `GET /api/transactions` - Get user's transactions
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id/confirm-payment` - Confirm payment (buyer)
- `PUT /api/transactions/:id/update-status` - Update status (seller)
- `GET /api/transactions/test` - Test route

### Verification (`/api/verify`)

- `POST /api/verify/submit` - Submit verification docs (seller)
- `GET /api/verify/status` - Get verification status (seller)
- `GET /api/verify/all` - Get all verifications (admin - placeholder)
- `PUT /api/verify/:id/approve` - Approve verification (admin - placeholder)
- `PUT /api/verify/:id/reject` - Reject verification (admin - placeholder)
- `GET /api/verify/test` - Test route

### Reports (`/api/reports`)

- `POST /api/reports` - Create report (buyer)
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports/:id` - Get single report
- `GET /api/reports/all` - Get all reports (admin - placeholder)
- `PUT /api/reports/:id/resolve` - Resolve report (admin - placeholder)
- `GET /api/reports/test` - Test route

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🛡️ Buyer Protection Features

1. **Seller Verification**: Only verified sellers can list products
2. **Transaction Tracking**: All purchases are tracked with status updates
3. **Scam Reporting**: Buyers can report suspicious sellers or transactions
4. **Payment Confirmation**: Buyers confirm payment before seller ships
5. **Dispute Resolution**: Built-in system for handling disputes

## 🧪 Testing Routes

All route modules include a test endpoint:
- `GET /api/auth/test`
- `GET /api/products/test`
- `GET /api/transactions/test`
- `GET /api/verify/test`
- `GET /api/reports/test`

## 🔮 Future Enhancements

- AI-driven fraud detection
- Escrow payment system integration
- Email notifications
- Admin dashboard
- Real-time chat between buyers and sellers
- Advanced search and filtering
- Product recommendations
- Rating and review system

## 📝 Notes

- The backend uses ES module syntax (`import/export`)
- All routes are prefixed with `/api`
- Error handling is centralized in `errorMiddleware.js`
- Seller verification is required before listing products
- Admin routes are placeholders and can be expanded with role-based access control

## 🤝 Contributing

This is a buyer-first marketplace focused on trust and safety. All features should prioritize buyer protection.

## 📄 License

ISC

