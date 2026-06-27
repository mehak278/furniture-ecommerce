const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Review = require('../models/Review');

// @desc    Register to become vendor (Create application)
// @route   POST /api/vendor/register
// @access  Private
exports.registerVendor = async (req, res) => {
  try {
    const { shopName, shopDescription, businessType, businessDocuments, bankDetails } = req.body;

    const vendorExists = await Vendor.findOne({ shopName });
    if (vendorExists) {
      return res.status(400).json({ success: false, message: 'Shop name already exists' });
    }

    const applicationExists = await Vendor.findOne({ user: req.user.id });
    if (applicationExists) {
      return res.status(400).json({
        success: false,
        message: `You already have a vendor application with status: ${applicationExists.status}`,
      });
    }

    const vendor = await Vendor.create({
      user: req.user.id,
      shopName,
      shopDescription,
      businessType,
      businessDocuments,
      bankDetails,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Vendor application submitted successfully. Pending Admin approval.',
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vendor dashboard analytics
// @route   GET /api/vendor/dashboard
// @access  Private/Vendor
exports.getVendorDashboard = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    // Total products count
    const totalProducts = await Product.countDocuments({ vendor: vendor._id });

    // Find orders that contain items from this vendor
    const orders = await Order.find({ 'orderItems.vendor': vendor._id });

    let salesThisMonth = 0;
    let pendingOrdersCount = 0;
    let processingOrdersCount = 0;
    let deliveredOrdersCount = 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.vendor.toString() === vendor._id.toString()) {
          // Count status
          if (item.itemStatus === 'pending') pendingOrdersCount++;
          if (item.itemStatus === 'processing') processingOrdersCount++;
          if (item.itemStatus === 'delivered') {
            deliveredOrdersCount++;
            
            // Check if delivered this month
            if (order.createdAt >= startOfMonth) {
              salesThisMonth += item.price * item.qty;
            }
          }
        }
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        salesThisMonth,
        pendingOrders: pendingOrdersCount,
        processingOrders: processingOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        pendingPayout: vendor.pendingPayout,
        totalEarnings: vendor.totalEarnings,
        rating: vendor.rating,
        totalReviews: vendor.totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vendor product catalog
// @route   GET /api/vendor/products
// @access  Private/Vendor
exports.getVendorProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const products = await Product.find({ vendor: vendor._id }).populate('category', 'name');
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vendor earnings and payouts info
// @route   GET /api/vendor/earnings
// @access  Private/Vendor
exports.getVendorEarnings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const payouts = await Payout.find({ vendor: vendor._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      earnings: {
        totalEarnings: vendor.totalEarnings,
        pendingPayout: vendor.pendingPayout,
      },
      payouts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request payout
// @route   POST /api/vendor/payout-request
// @access  Private/Vendor
exports.requestPayout = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const amountToPayout = vendor.pendingPayout;
    if (amountToPayout <= 0) {
      return res.status(400).json({ success: false, message: 'No pending earnings available for payout' });
    }

    // Calculate platform commission on this payout based on vendor rate
    const commission = (amountToPayout * vendor.commissionRate) / (100 - vendor.commissionRate); 
    // Wait, the orderItem.vendorEarning is already net of commission!
    // Let's re-verify. Yes, vendor.totalEarnings and pendingPayout are already net of commission because:
    // vendorEarning = itemPrice - commission
    // So the netAmount paid to vendor = amountToPayout.
    // The commission was already deducted at checkout.
    // Therefore:
    // netAmount = amountToPayout
    // Let's record this clearly:
    const netAmount = amountToPayout;
    const platformCommissionDeducted = (amountToPayout / (1 - vendor.commissionRate / 100)) * (vendor.commissionRate / 100);

    const payout = await Payout.create({
      vendor: vendor._id,
      amount: netAmount + platformCommissionDeducted, // Gross
      commission: platformCommissionDeducted,
      netAmount: netAmount,
      status: 'pending',
    });

    // Zero out vendor pending payout
    vendor.pendingPayout = 0;
    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Payout request sent successfully',
      payout,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update vendor shop profile
// @route   PUT /api/vendor/profile
// @access  Private/Vendor
exports.updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    vendor.shopName = req.body.shopName || vendor.shopName;
    vendor.shopDescription = req.body.shopDescription || vendor.shopDescription;
    vendor.shopLogo = req.body.shopLogo || vendor.shopLogo;
    vendor.shopBanner = req.body.shopBanner || vendor.shopBanner;
    
    if (req.body.bankDetails) {
      vendor.bankDetails = {
        accountName: req.body.bankDetails.accountName || vendor.bankDetails.accountName,
        accountNumber: req.body.bankDetails.accountNumber || vendor.bankDetails.accountNumber,
        bankName: req.body.bankDetails.bankName || vendor.bankDetails.bankName,
      };
    }

    await vendor.save();

    res.status(200).json({ success: true, message: 'Vendor profile updated successfully', vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vendor product reviews
// @route   GET /api/vendor/reviews
// @access  Private/Vendor
exports.getVendorReviews = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const reviews = await Review.find({ vendor: vendor._id })
      .populate('product', 'name slug images')
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
