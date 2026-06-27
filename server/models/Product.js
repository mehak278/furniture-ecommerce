const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  color: { type: String }, // Hex code e.g. #FFFFFF
  colorName: { type: String }, // e.g. White
  material: { type: String }, // e.g. Velvet
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
  ],
  stock: { type: Number, default: 0 },
  price: { type: Number }, // Option to override base price
});

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please add product stock count'],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, 'Please add a product SKU'],
      unique: true,
    },
    variants: [variantSchema],
    dimensions: {
      length: { type: Number }, // in cm
      width: { type: Number }, // in cm
      height: { type: Number }, // in cm
      weight: { type: Number }, // in kg
    },
    material: {
      type: String,
      required: [true, 'Please specify product material'],
    },
    finish: {
      type: String,
      default: '',
    },
    assemblyRequired: {
      type: Boolean,
      default: false,
    },
    deliveryDays: {
      type: Number,
      default: 7,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    freeDeliveryAbove: {
      type: Number,
      default: 0,
    },
    warrantyMonths: {
      type: Number,
      default: 0,
    },
    careInstructions: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create product slug and calculate discount percentage before save
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }

  if (this.isModified('price') || this.isModified('discountPrice')) {
    if (this.discountPrice && this.discountPrice < this.price) {
      this.discountPercent = Math.round(
        ((this.price - this.discountPrice) / this.price) * 100
      );
    } else {
      this.discountPercent = 0;
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
