const express = require('express');
const {
  registerVendor,
  checkVendorStatus,
  getVendorDashboard,
  getVendorProducts,
  getVendorEarnings,
  requestPayout,
  updateVendorProfile,
  getVendorReviews,
} = require('../controllers/vendorController');
const { protect, isVendor } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect to all routes
router.use(protect);

// Registration is accessible to normal users who want to apply
router.post('/register', registerVendor);

// Check if current user has a vendor application (any role can call this)
router.get('/my-status', checkVendorStatus);

// All other routes require Vendor verification
router.get('/dashboard', isVendor, getVendorDashboard);
router.get('/products', isVendor, getVendorProducts);
router.get('/earnings', isVendor, getVendorEarnings);
router.post('/payout-request', isVendor, requestPayout);
router.put('/profile', isVendor, updateVendorProfile);
router.get('/reviews', isVendor, getVendorReviews);

module.exports = router;
