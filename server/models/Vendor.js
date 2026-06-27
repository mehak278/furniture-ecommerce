const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopName: {
      type: String,
      required: [true, 'Please add a shop name'],
      unique: true,
      trim: true,
    },
    shopDescription: {
      type: String,
      required: [true, 'Please add a shop description'],
    },
    shopLogo: {
      type: String,
      default: '',
    },
    shopBanner: {
      type: String,
      default: '',
    },
    businessType: {
      type: String,
      required: [true, 'Please specify business type'],
    },
    hasPhysicalStore: {
      type: Boolean,
      default: false,
    },
    storeAddress: {
      type: String,
      default: '',
    },
    businessDocuments: {
      type: String, // URL to document (CNIC, etc.)
      required: [true, 'Please upload business document/CNIC'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
    },
    commissionRate: {
      type: Number,
      default: 10, // Default 10%
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    pendingPayout: {
      type: Number,
      default: 0,
    },
    bankDetails: {
      accountName: {
        type: String,
        required: [true, 'Please add bank account name'],
      },
      accountNumber: {
        type: String,
        required: [true, 'Please add bank account number'],
      },
      bankName: {
        type: String,
        required: [true, 'Please add bank name'],
      },
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Vendor', vendorSchema);
