const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a banner title'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please upload banner image'],
    },
    link: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      enum: ['hero', 'sidebar', 'popup'],
      default: 'hero',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
