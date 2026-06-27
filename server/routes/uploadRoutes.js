const express = require('express');
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect, isVendor } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.use(isVendor); // Only vendors or admins can upload product images

router.post('/image', upload.single('image'), uploadImage);
router.delete('/image', deleteImage);

module.exports = router;
