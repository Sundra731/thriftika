import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiArrowLeft, FiPackage } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import api from '../utils/api';
import { API_ENDPOINTS, PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '../utils/constants';

const AddProduct = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    size: '',
    condition: '',
    tags: '',
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or not a seller
  if (!isAuthenticated || user?.role !== 'seller') {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 5 images
    if (files.length + imageFiles.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      showToast('Only JPG, PNG, and WebP images are allowed', 'error');
      return;
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      showToast('Each image must be less than 5MB', 'error');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data
      const submitData = new FormData();

      // Add basic fields
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          // Convert tags string to array
          const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          submitData.append(key, JSON.stringify(tagsArray));
        } else if (key !== 'images') {
          submitData.append(key, formData[key]);
        }
      });

      // Add images
      imageFiles.forEach((file, index) => {
        submitData.append('images', file);
      });

      // Submit to API
      const response = await api.post(API_ENDPOINTS.PRODUCTS.ALL, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Product added successfully!', 'success');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Error adding product:', error);
      const message = error.response?.data?.message || 'Failed to add product';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center space-x-2 text-secondary-600 dark:text-light-400 hover:text-secondary-900 dark:hover:text-light-100 mb-4"
          >
            <FiArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-light-100 mb-2">
            Add New Product
          </h1>
          <p className="text-secondary-600 dark:text-light-300">
            List your thrift item for sale and reach thousands of buyers
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Vintage Denim Jacket"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                  Price (KES) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="1"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., 2500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Describe your product in detail. Include brand, size, condition, and any other relevant information."
              />
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select Category</option>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select Condition</option>
                  {PRODUCT_CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                  Size (Optional)
                </label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., M, 32, 8"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., vintage, denim, 90s (separate with commas)"
              />
              <p className="text-xs text-secondary-500 dark:text-light-400 mt-1">
                Add relevant tags to help buyers find your product
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-light-300 mb-2">
                Product Images *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 dark:border-dark-600 border-dashed rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-secondary-50 dark:bg-dark-800">
                <div className="space-y-1 text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-secondary-400 dark:text-dark-500" />
                  <div className="flex text-sm text-secondary-600 dark:text-light-400">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white dark:bg-dark-700 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none px-3 py-2"
                    >
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-light-400">
                    PNG, JPG, WebP up to 5MB each (max 5 images)
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-secondary-200 dark:border-dark-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/seller/dashboard"
                className="btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || imageFiles.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding Product...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiPackage className="h-5 w-5" />
                    <span>Add Product</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;