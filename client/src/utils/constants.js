export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  PRODUCTS: {
    ALL: '/products',
    BY_ID: (id) => `/products/${id}`,
    MY_PRODUCTS: '/products/seller/my-products',
  },
  TRANSACTIONS: {
    ALL: '/transactions',
    BY_ID: (id) => `/transactions/${id}`,
    CREATE: '/transactions',
  },
  REPORTS: {
    CREATE: '/reports',
    MY_REPORTS: '/reports/my-reports',
    BY_ID: (id) => `/reports/${id}`,
  },
  VERIFICATION: {
    STATUS: '/verify/status',
    SUBMIT: '/verify/submit',
  },
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    STATUS: (id) => `/payments/status/${id}`,
    MY_TRANSACTIONS: '/payments/my-transactions',
  },
};

export const PRODUCT_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'other', label: 'Other' },
];

export const PRODUCT_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export const REPORT_REASONS = [
  { value: 'fake-product', label: 'Fake Product' },
  { value: 'item-not-received', label: 'Item Not Received' },
  { value: 'item-damaged', label: 'Item Damaged' },
  { value: 'wrong-item', label: 'Wrong Item' },
  { value: 'scam', label: 'Scam' },
  { value: 'fraudulent-payment', label: 'Fraudulent Payment' },
  { value: 'other', label: 'Other' },
];




