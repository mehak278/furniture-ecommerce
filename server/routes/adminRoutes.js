const express = require('express');
const {
  getAdminDashboard,
  getAdminUsers,
  blockUser,
  deleteUser,
  getAdminVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  setVendorCommission,
  getAdminProducts,
  approveProduct,
  rejectProduct,
  toggleProductFeature,
  getAdminPayouts,
  processPayout,
  getAdminReviews,
  approveReview,
  deleteAdminReview,
  createBanner,
  updateBanner,
  deleteBanner,
  createCoupon,
  updateCoupon,
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply admin safeguards to all routes
router.use(protect);
router.use(isAdmin);

router.get('/dashboard', getAdminDashboard);

// User moderation
router.get('/users', getAdminUsers);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);

// Vendor management
router.get('/vendors', getAdminVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.put('/vendors/:id/suspend', suspendVendor);
router.put('/vendors/:id/commission', setVendorCommission);

// Product moderation
router.get('/products', getAdminProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);
router.put('/products/:id/feature', toggleProductFeature);

// Payout processing
router.get('/payouts', getAdminPayouts);
router.put('/payouts/:id/process', processPayout);

// Review management
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/approve', approveReview);
router.delete('/reviews/:id', deleteAdminReview);

// Banner management
router.route('/banners')
  .post(createBanner);

router.route('/banners/:id')
  .put(updateBanner)
  .delete(deleteBanner);

// Coupon management
router.route('/coupons')
  .post(createCoupon);

router.route('/coupons/:id')
  .put(updateCoupon);

module.exports = router;
