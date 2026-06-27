const express = require('express');
const {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, isVendor } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, isVendor, createProduct);

router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);

router.route('/:slug')
  .get(getProductBySlug);

router.route('/:id')
  .put(protect, isVendor, updateProduct)
  .delete(protect, isVendor, deleteProduct);

module.exports = router;
