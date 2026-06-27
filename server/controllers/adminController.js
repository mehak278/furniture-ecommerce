const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Review = require('../models/Review');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVendors = await Vendor.countDocuments({ status: 'approved' });
    const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
    const pendingProducts = await Product.countDocuments({ isApproved: false });

    // Calculate total platform revenue (commissions from all orders)
    const orders = await Order.find({ paymentStatus: 'paid' });
    let totalGrossSales = 0;
    let totalCommissions = 0;

    orders.forEach((order) => {
      totalGrossSales += order.totalAmount;
      order.orderItems.forEach((item) => {
        totalCommissions += item.commission;
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        pendingVendors,
        pendingProducts,
        totalGrossSales: Math.round(totalGrossSales * 100) / 100,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block admin users' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been successfully ${user.isActive ? 'unblocked' : 'blocked'}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all vendors (applications + registered)
// @route   GET /api/admin/vendors
// @access  Private/Admin
exports.getAdminVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email phone').sort('-createdAt');
    res.status(200).json({ success: true, count: vendors.length, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve vendor application
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private/Admin
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor application not found' });
    }

    vendor.status = 'approved';
    await vendor.save();

    // Update the user's role to vendor
    await User.findByIdAndUpdate(vendor.user, { role: 'vendor' });

    // Notify user
    await Notification.create({
      user: vendor.user,
      type: 'vendor_approval',
      title: 'Vendor Application Approved',
      message: 'Congratulations! Your shop application is approved. You can now access the vendor dashboard.',
      link: '/vendor/dashboard',
    });

    res.status(200).json({ success: true, message: 'Vendor application approved', vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject vendor application
// @route   PUT /api/admin/vendors/:id/reject
// @access  Private/Admin
exports.rejectVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor application not found' });
    }

    vendor.status = 'pending'; // or let's create a custom flow, but delete is fine or keep status suspended/rejected.
    // Let's set status to suspended/pending or delete. We'll set to rejected (let's add 'rejected' to Vendor.js status, wait, Vendor.js has ["pending", "approved", "suspended"]. So let's delete or set to suspended).
    // Let's set status to suspended as rejected equivalent, or just delete it. We'll delete it to let them re-apply.
    await Vendor.findByIdAndDelete(req.params.id);

    // Notify user
    await Notification.create({
      user: vendor.user,
      type: 'vendor_approval',
      title: 'Vendor Application Rejected',
      message: 'Unfortunately, your vendor application was rejected. Please review your details and re-apply.',
    });

    res.status(200).json({ success: true, message: 'Vendor application rejected and removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend vendor
// @route   PUT /api/admin/vendors/:id/suspend
// @access  Private/Admin
exports.suspendVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendor.status = vendor.status === 'suspended' ? 'approved' : 'suspended';
    await vendor.save();

    // Notify user
    await Notification.create({
      user: vendor.user,
      type: 'vendor_approval',
      title: vendor.status === 'suspended' ? 'Vendor Account Suspended' : 'Vendor Account Reinstated',
      message: vendor.status === 'suspended' 
        ? 'Your vendor account has been suspended by the platform administrator.'
        : 'Your vendor account has been reinstated. You can list products again.',
    });

    res.status(200).json({ success: true, message: `Vendor status set to ${vendor.status}`, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set vendor commission override
// @route   PUT /api/admin/vendors/:id/commission
// @access  Private/Admin
exports.setVendorCommission = async (req, res) => {
  try {
    const { commissionRate } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendor.commissionRate = commissionRate;
    await vendor.save();

    res.status(200).json({ success: true, message: `Vendor commission rate updated to ${commissionRate}%`, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('vendor', 'shopName')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve product
// @route   PUT /api/admin/products/:id/approve
// @access  Private/Admin
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isApproved = true;
    product.approvedAt = Date.now();
    await product.save();

    // Notify vendor
    await Notification.create({
      user: product.vendor.user,
      type: 'product_approval',
      title: 'Product Approved',
      message: `Your product "${product.name}" has been approved and is now live on the storefront.`,
      link: `/shop/product/${product.slug}`,
    });

    res.status(200).json({ success: true, message: 'Product approved and is now live', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject product
// @route   PUT /api/admin/products/:id/reject
// @access  Private/Admin
exports.rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isApproved = false;
    await product.save();

    // Notify vendor
    await Notification.create({
      user: product.vendor.user,
      type: 'product_approval',
      title: 'Product Rejected / Suspended',
      message: `Your product "${product.name}" has been rejected/suspended by Admin.`,
    });

    res.status(200).json({ success: true, message: 'Product rejected/suspended', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle product feature status (Featured on home page)
// @route   PUT /api/admin/products/:id/feature
// @access  Private/Admin
exports.toggleProductFeature = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product is now ${product.isFeatured ? 'featured' : 'unfeatured'}`,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payout requests
// @route   GET /api/admin/payouts
// @access  Private/Admin
exports.getAdminPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find().populate('vendor', 'shopName bankDetails').sort('-createdAt');
    res.status(200).json({ success: true, count: payouts.length, payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process Payout
// @route   PUT /api/admin/payouts/:id/process
// @access  Private/Admin
exports.processPayout = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Please provide transaction ID' });
    }

    const payout = await Payout.findById(req.params.id).populate('vendor');
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout request not found' });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Payout already processed with status: ${payout.status}` });
    }

    payout.status = 'completed';
    payout.transactionId = transactionId;
    payout.processedAt = Date.now();
    await payout.save();

    // Notify Vendor
    await Notification.create({
      user: payout.vendor.user,
      type: 'payout',
      title: 'Payout Processed',
      message: `Your payout request of Net PKR ${payout.netAmount} was processed. Transaction ID: ${transactionId}.`,
      link: '/vendor/earnings',
    });

    res.status(200).json({ success: true, message: 'Payout request processed successfully', payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name slug')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve review
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = true;
    await review.save();

    // Trigger ratings recalculation
    await Review.getAverageRating(review.product);
    await Review.getVendorAverageRating(review.vendor);

    res.status(200).json({ success: true, message: 'Review approved successfully', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteAdminReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    const vendorId = review.vendor;

    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating
    await Review.getAverageRating(productId);
    await Review.getVendorAverageRating(vendorId);

    res.status(200).json({ success: true, message: 'Review deleted by Admin successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Banner
// @route   POST /api/admin/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const { title, image, link, position, order } = req.body;
    const banner = await Banner.create({ title, image, link, position, order });
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.status(200).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountAmount, minOrderValue, usageLimit, expiryDate } = req.body;
    
    const couponExists = await Coupon.findOne({ code });
    if (couponExists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountAmount,
      minOrderValue,
      usageLimit,
      expiryDate,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
