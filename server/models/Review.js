const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Please add a review title'],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, 'Please add a review comment'],
    },
    images: [
      {
        type: String,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get average rating of a product and update it in Product model
reviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId, isApproved: true },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Product').findByIdAndUpdate(productId, {
        'ratings.average': Math.round(obj[0].averageRating * 10) / 10,
        'ratings.count': obj[0].count,
      });
    } else {
      await this.model('Product').findByIdAndUpdate(productId, {
        'ratings.average': 0,
        'ratings.count': 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Static method to update Vendor rating
reviewSchema.statics.getVendorAverageRating = async function (vendorId) {
  const obj = await this.aggregate([
    {
      $match: { vendor: vendorId, isApproved: true },
    },
    {
      $group: {
        _id: '$vendor',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Vendor').findByIdAndUpdate(vendorId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        totalReviews: obj[0].count,
      });
    } else {
      await this.model('Vendor').findByIdAndUpdate(vendorId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.product);
  await this.constructor.getVendorAverageRating(this.vendor);
});

// Call getAverageRating before remove
reviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.product);
  await this.constructor.getVendorAverageRating(this.vendor);
});

module.exports = mongoose.model('Review', reviewSchema);
