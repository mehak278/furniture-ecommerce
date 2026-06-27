const stripe = require('../config/stripe');

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // Stripe expects amount in cents/paisa, so multiply by 100
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd', // or PKR, depending on Stripe configuration
      metadata: { integration_check: 'accept_a_payment', userId: req.user.id },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cash on Delivery confirmation
// @route   POST /api/payments/cod
// @access  Private
exports.processCodPayment = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Cash on delivery payment selected. Order status marked as pending.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stripe Webhook listener (for order status synchronization)
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
    // Here we would find the order by payment intent ID and mark it paid
  }

  res.json({ received: true });
};
