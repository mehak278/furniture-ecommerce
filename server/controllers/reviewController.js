const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create a review for a product
// @route   POST /api/reviews/:productId
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user.id,
    });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed by you' });
    }

    // Check if user purchased this product and it was delivered
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      paymentStatus: 'paid',
      orderItems: {
        $elemMatch: {
          product: productId,
          itemStatus: 'delivered',
        },
      },
    });

    const isVerifiedPurchase = !!hasPurchased;

    if (!isVerifiedPurchase) {
      return res.status(400).json({ success: false, message: 'You can only review products you have purchased and received' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      vendor: product.vendor,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this review' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.images = images || review.images;

    await review.save(); // Save triggers the average rating calculations

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
    }

    // Capture product and vendor IDs for rating updates after delete
    const productId = review.product;
    const vendorId = review.vendor;

    await Review.findByIdAndDelete(req.params.id);

    // Manually trigger rating recalculation since post 'remove' sometimes doesn't fire on direct delete
    const tempReview = new Review({ product: productId, vendor: vendorId });
    await Review.getAverageRating(productId);
    await Review.getVendorAverageRating(vendorId);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
