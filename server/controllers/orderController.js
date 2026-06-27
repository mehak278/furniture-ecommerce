const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const Commission = require('../models/Commission');
const calculateCommission = require('../utils/calculateCommission');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      deliverySlot,
      paymentMethod,
      paymentResult,
      subtotal,
      deliveryCharge,
      discount,
      totalAmount,
      couponCode,
      couponDiscount,
      assemblyRequested,
      deliveryNotes,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    // Double check stock and calculate commission per item
    const finalOrderItems = [];
    
    for (const item of orderItems) {
      const product = await Product.findById(item.product).populate('vendor');
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` });
      }

      // Get vendor commission rate (default is 10)
      const commissionRate = product.vendor.commissionRate || 10;
      const calc = calculateCommission(item.price, item.qty, commissionRate);

      finalOrderItems.push({
        product: product._id,
        vendor: product.vendor._id,
        name: product.name,
        image: product.images[0]?.url || item.image || '',
        price: item.price,
        qty: item.qty,
        color: item.color,
        material: item.material,
        vendorEarning: calc.vendorEarning,
        commission: calc.commission,
        itemStatus: 'pending',
      });

      // Decrement stock
      product.stock -= item.qty;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems: finalOrderItems,
      shippingAddress,
      deliverySlot,
      paymentMethod,
      paymentStatus: paymentMethod === 'stripe' ? 'paid' : 'pending',
      paymentResult,
      subtotal,
      deliveryCharge,
      discount,
      totalAmount,
      couponCode,
      couponDiscount,
      assemblyRequested,
      deliveryNotes,
    });

    // Post-order processing:
    // 1. Create commissions records
    // 2. Create notifications for vendors
    for (const item of order.orderItems) {
      // Record commission log
      await Commission.create({
        order: order._id,
        vendor: item.vendor,
        itemPrice: item.price,
        qty: item.qty,
        totalAmount: item.price * item.qty,
        commissionRate: Math.round((item.commission / (item.price * item.qty)) * 100),
        commissionAmount: item.commission,
      });

      // Get vendor user id to notify them
      const vendorInfo = await Vendor.findById(item.vendor);
      if (vendorInfo) {
        // Increment pending payout and total earnings for vendor once delivered, but we can log notification now
        await Notification.create({
          user: vendorInfo.user,
          type: 'order',
          title: 'New Order Received',
          message: `You received an order for ${item.qty}x ${item.name}.`,
          link: `/vendor/orders/${order._id}`,
        });
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product')
      .populate('orderItems.vendor', 'shopName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is owner, or vendor of an item, or admin
    const isOwner = order.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    let isItemVendor = false;
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (vendor) {
        isItemVendor = order.orderItems.some(
          (item) => item.vendor.toString() === vendor._id.toString()
        );
      }
    }

    if (!isOwner && !isAdmin && !isItemVendor) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order can only be cancelled if it is pending' });
    }

    order.orderStatus = 'cancelled';
    order.paymentStatus = order.paymentMethod === 'stripe' ? 'refunded' : 'cancelled';
    
    // Set all item statuses to cancelled
    order.orderItems.forEach((item) => {
      item.itemStatus = 'cancelled';
    });

    await order.save();

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty },
      });
    }

    res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a return
// @route   POST /api/orders/:id/return
// @access  Private
exports.requestReturn = async (req, res) => {
  try {
    const { itemId, reason, comments } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const item = order.orderItems.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in order' });
    }

    if (item.itemStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered items can be returned' });
    }

    // Verify 7 day return window
    const deliveredDays = (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 3600 * 24);
    if (deliveredDays > 7) {
      return res.status(400).json({ success: false, message: 'Return window (7 days) has expired' });
    }

    item.itemStatus = 'returned';
    await order.save();

    // Notify Vendor & Admin
    const vendor = await Vendor.findById(item.vendor);
    if (vendor) {
      await Notification.create({
        user: vendor.user,
        type: 'order',
        title: 'Return Request',
        message: `Customer requested return for ${item.name}. Reason: ${reason}.`,
        link: `/vendor/orders/${order._id}`,
      });
    }

    res.status(200).json({ success: true, message: 'Return request submitted successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vendor incoming orders
// @route   GET /api/vendor/orders
// @access  Private/Vendor
exports.getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    // Find orders that contain items from this vendor
    const orders = await Order.find({
      'orderItems.vendor': vendor._id,
    })
      .populate('user', 'name phone email')
      .sort('-createdAt');

    // Filter items to only show the ones belonging to this vendor
    const filteredOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.orderItems = orderObj.orderItems.filter(
        (item) => item.vendor.toString() === vendor._id.toString()
      );
      return orderObj;
    });

    res.status(200).json({ success: true, count: filteredOrders.length, orders: filteredOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update status of an order item (Vendor only)
// @route   PUT /api/vendor/orders/:id/status
// @access  Private/Vendor
exports.updateVendorOrderItemStatus = async (req, res) => {
  try {
    const { itemId, status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const item = order.orderItems.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in order' });
    }

    if (item.vendor.toString() !== vendor._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to manage this item' });
    }

    // Update status
    item.itemStatus = status;

    // Logics depending on item statuses:
    // If status is 'delivered', we credit vendor earnings
    if (status === 'delivered') {
      vendor.totalEarnings += item.vendorEarning;
      vendor.pendingPayout += item.vendorEarning;
      await vendor.save();
    }

    // Determine derived orderStatus from all orderItems
    const statuses = order.orderItems.map((i) => i.itemStatus);
    
    if (statuses.every((s) => s === 'delivered')) {
      order.orderStatus = 'delivered';
      order.paymentStatus = 'paid';
      order.deliveredAt = Date.now();
    } else if (statuses.every((s) => s === 'cancelled')) {
      order.orderStatus = 'cancelled';
    } else if (statuses.some((s) => s === 'shipped' || s === 'delivered' || s === 'processing')) {
      order.orderStatus = 'processing';
    }

    await order.save();

    // Notify user
    await Notification.create({
      user: order.user,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your item "${item.name}" is now ${status}.`,
      link: `/user/orders/${order._id}`,
    });

    res.status(200).json({ success: true, message: 'Order item status updated', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.vendor', 'shopName')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
