const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  getVendorOrders,
  updateVendorOrderItemStatus,
  getAdminOrders,
} = require('../controllers/orderController');
const { protect, isVendor, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Publicly protect all routes in this file
router.use(protect);

// Customer order routes
router.route('/')
  .post(createOrder);

router.get('/my', getMyOrders);

// Vendor order routes (needs vendor guard)
router.get('/vendor', isVendor, getVendorOrders);
router.put('/vendor/:id/status', isVendor, updateVendorOrderItemStatus);

// Admin order routes (needs admin guard)
router.get('/admin', isAdmin, getAdminOrders);

// Detailed order route
router.route('/:id')
  .get(getOrderById);

router.put('/:id/cancel', cancelOrder);
router.post('/:id/return', requestReturn);

module.exports = router;
