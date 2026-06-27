const express = require('express');
const {
  createPaymentIntent,
  processCodPayment,
  stripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/cod', protect, processCodPayment);

// Webhook must be public and receive raw express.raw() body in server.js
router.post('/webhook', stripeWebhook);

module.exports = router;
