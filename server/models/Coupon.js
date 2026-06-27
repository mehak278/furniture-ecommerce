const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Please specify discount type'],
    },
    discountAmount: {
      type: Number,
      required: [true, 'Please specify discount amount'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: 100, // max times this coupon can be used overall
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please specify expiry date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate if coupon can be used
couponSchema.methods.isValid = function (orderValue) {
  const now = new Date();
  if (!this.isActive) return false;
  if (now > this.expiryDate) return false;
  if (this.usageCount >= this.usageLimit) return false;
  if (orderValue < this.minOrderValue) return false;
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
