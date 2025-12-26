import Product from '../models/Product.js';

/**
 * @route   GET /api/products/test
 * @desc    Test products route
 * @access  Public
 */
export const testRoute = (req, res) => {
  res.json({ message: 'Products route working ✅' });
};

/**
 * @route   GET /api/products
 * @desc    Get all available products (with optional filters)
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, seller } = req.query;

    // Build filter object
    const filter = { isAvailable: true, isSold: false };

    if (category) filter.category = category;
    if (seller) filter.seller = seller;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build search query
    let query = Product.find(filter).populate('seller', 'name email isVerified');

    if (search) {
      query = query.find({ $text: { $search: search } });
    }

    // Execute query
    const products = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name email isVerified'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/products
 * @desc    Create new product (verified sellers only)
 * @access  Private (Seller, Verified)
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      size,
      condition,
      tags,
      thriftikaTagPhoto, // Security measure #3 - REQUIRED
      tagPhotoDate, // Date shown in the tag photo
    } = req.body;

    // Validate Thriftika tag photo - Security measure #3
    if (!thriftikaTagPhoto) {
      return res.status(400).json({ 
        message: 'Thriftika tag photo is required. Please upload a photo of the item with a handwritten note showing "Thriftika" and today\'s date.' 
      });
    }

    if (!tagPhotoDate) {
      return res.status(400).json({ 
        message: 'Tag photo date is required. Please provide the date shown in your tag photo.' 
      });
    }

    // Validate date is recent (within last 7 days)
    const photoDate = new Date(tagPhotoDate);
    const daysDiff = (Date.now() - photoDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7 || daysDiff < 0) {
      return res.status(400).json({ 
        message: 'Tag photo date must be within the last 7 days and cannot be in the future.' 
      });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      size,
      condition,
      images: imageUrls,
      tags: tags ? JSON.parse(tags) : [],
      seller: req.user._id,
      thriftikaTagPhoto,
      tagPhotoDate: photoDate,
      tagPhotoVerified: false, // Will be verified by admin
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (seller who owns it)
 * @access  Private (Seller)
 */
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (seller who owns it)
 * @access  Private (Seller)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/products/seller/my-products
 * @desc    Get all products by logged-in seller
 * @access  Private (Seller)
 */
export const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};






