import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';

const Cart = () => {
  const { cart, loading, fetchCart, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      await updateQuantity(productId, newQuantity);
      showToast('Cart updated', 'success');
    } catch (error) {
      showToast('Failed to update cart', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    try {
      await removeFromCart(productId);
      showToast(`${productName} removed from cart`, 'success');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;

    try {
      await clearCart();
      showToast('Cart cleared', 'success');
    } catch (error) {
      showToast('Failed to clear cart', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Please sign in</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to be signed in to view your cart.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="btn-primary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading your cart...</div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start shopping to add items to your cart.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="btn-primary"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Shopping Cart ({cart.totalItems} items)
              </h1>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <div key={item._id} className="p-6">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <img
                    src={item.product?.images?.[0] || '/default-product.png'}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.product?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Condition: {item.product?.condition}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${item.product?.price} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      disabled={updatingItems.has(item.product._id)}
                      className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>

                    <span className="text-lg font-medium w-8 text-center">
                      {updatingItems.has(item.product._id) ? '...' : item.quantity}
                    </span>

                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      disabled={updatingItems.has(item.product._id)}
                      className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      ${(item.product?.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.product._id, item.product?.name)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Total: ${cart.totalPrice?.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex space-x-3">
                <Link
                  to="/products"
                  className="btn-secondary"
                >
                  Continue Shopping
                </Link>
                <button
                  className="btn-primary"
                  onClick={() => showToast('Checkout feature coming soon!', 'info')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;