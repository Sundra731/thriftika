import { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const Products = () => {
  const { products, loading, fetchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts({
      search: searchTerm,
      category: selectedCategory !== 'all' ? selectedCategory : null,
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchProducts({
      search: searchTerm,
      category: category !== 'all' ? category : null,
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-light-100 mb-2">Browse Products</h1>
          <p className="text-secondary-600 dark:text-light-300">Discover verified thrift fashion from trusted sellers</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-secondary-400 dark:text-light-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for products..."
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiFilter className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </form>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-primary-600 dark:bg-primary-500 text-light-100'
                    : 'bg-light-50 dark:bg-dark-800 text-secondary-700 dark:text-light-200 hover:bg-light-100 dark:hover:bg-dark-700 border border-light-200 dark:border-dark-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
            <p className="mt-4 text-secondary-600 dark:text-light-400">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-light-50 dark:bg-dark-800 rounded-lg border border-light-200 dark:border-dark-700">
            <p className="text-secondary-600 dark:text-light-400 text-lg">No products found</p>
            <p className="text-secondary-500 dark:text-light-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;




