const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a recipient name'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    addressLine: {
      type: String,
      required: [true, 'Please add the street address'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    province: {
      type: String,
      required: [true, 'Please add a province/state'],
    },
    postalCode: {
      type: String,
      required: [true, 'Please add a postal code'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Address', addressSchema);
