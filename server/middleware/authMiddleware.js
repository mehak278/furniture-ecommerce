const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'User account is deactivated' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Check if user is Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
};

// Check if user is Vendor
const isVendor = async (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    // Check if the vendor is approved in the Vendor collection
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Vendor profile not found.' });
    }
    if (vendor && vendor.status !== 'approved' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Vendor status is ${vendor.status}.` 
      });
    }
    req.vendor = vendor; // Attach vendor info to request
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Vendor role required.' });
  }
};

module.exports = { protect, isAdmin, isVendor };
