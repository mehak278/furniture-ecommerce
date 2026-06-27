const Product = require('../models/Product');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all products (with filtering, sorting, pagination)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // Only fetch approved and active products for public listing
    const baseQuery = { isApproved: true, isActive: true };
    
    // Check if category slug is passed to filter by category
    if (req.query.categorySlug) {
      const category = await Category.findOne({ slug: req.query.categorySlug });
      if (category) {
        baseQuery.category = category._id;
      } else {
        return res.status(200).json({ success: true, count: 0, products: [] });
      }
      delete req.query.categorySlug;
    }

    // Check if vendor slug is passed
    if (req.query.vendorSlug) {
      const vendor = await Vendor.findOne({ shopName: new RegExp(req.query.vendorSlug.replace('-', ' '), 'i') });
      if (vendor) {
        baseQuery.vendor = vendor._id;
      } else {
        return res.status(200).json({ success: true, count: 0, products: [] });
      }
      delete req.query.vendorSlug;
    }

    // Handle search query
    if (req.query.q) {
      baseQuery.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } },
        { material: { $regex: req.query.q, $options: 'i' } },
      ];
      delete req.query.q;
    }

    // Count all matching documents before pagination
    const totalCountQuery = new APIFeatures(Product.find(baseQuery), req.query).filter();
    const totalCountDocs = await totalCountQuery.query;
    const totalCount = totalCountDocs.length;

    // Apply APIFeatures
    const features = new APIFeatures(Product.find(baseQuery), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate(12);

    const products = await features.query
      .populate('category', 'name slug')
      .populate('vendor', 'shopName rating totalReviews shopLogo');

    res.status(200).json({
      success: true,
      count: products.length,
      totalCount,
      totalPages: Math.ceil(totalCount / (parseInt(req.query.limit) || 12)),
      currentPage: parseInt(req.query.page) || 1,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug parentCategory')
      .populate('vendor', 'shopName shopLogo rating totalReviews shopDescription user');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isApproved: true,
      isActive: true,
    })
      .limit(8)
      .populate('category', 'name')
      .populate('vendor', 'shopName rating');

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({
      isApproved: true,
      isActive: true,
    })
      .sort('-createdAt')
      .limit(8)
      .populate('category', 'name')
      .populate('vendor', 'shopName rating');

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product (Vendor only)
// @route   POST /api/products
// @access  Private/Vendor
exports.createProduct = async (req, res) => {
  try {
    // Check if user is vendor and approved
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor || vendor.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Only approved vendors can add products' });
    }

    // Attach vendor ID to req.body
    req.body.vendor = vendor._id;
    // Set status to unapproved initially
    req.body.isApproved = false;

    const product = await Product.create(req.body);

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Vendor owner or Admin)
// @route   PUT /api/products/:id
// @access  Private/Vendor
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const vendor = await Vendor.findOne({ user: req.user.id });

    // Verify ownership or admin role
    if (
      req.user.role !== 'admin' &&
      (!vendor || product.vendor.toString() !== vendor._id.toString())
    ) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this product' });
    }

    // If edited by vendor, reset approval status
    if (req.user.role !== 'admin') {
      req.body.isApproved = false;
      req.body.approvedAt = undefined;
    }

    // Fields that cannot be changed directly via basic update
    delete req.body.vendor;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (Vendor owner or Admin)
// @route   DELETE /api/products/:id
// @access  Private/Vendor
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const vendor = await Vendor.findOne({ user: req.user.id });

    // Verify ownership or admin role
    if (
      req.user.role !== 'admin' &&
      (!vendor || product.vendor.toString() !== vendor._id.toString())
    ) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
