const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add payout gross amount'],
    },
    commission: {
      type: Number,
      required: [true, 'Please add payout platform commission'],
    },
    netAmount: {
      type: Number,
      required: [true, 'Please add payout net amount'],
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    processedAt: {
      type: Date,
    },
    transactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payout', payoutSchema);
