const cloudinary = require('../config/cloudinary');

// @desc    Upload an image
// @route   POST /api/upload/image
// @access  Private/Vendor/Admin
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an image from Cloudinary
// @route   DELETE /api/upload/image
// @access  Private/Vendor/Admin
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ success: false, message: 'Please provide publicId of the image to delete' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({ success: true, message: 'Image deleted from Cloudinary' });
    } else {
      res.status(400).json({ success: false, message: `Cloudinary response: ${result.result}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
