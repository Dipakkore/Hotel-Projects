const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); // Load .env variables

// Validate required env variables
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  throw new Error("❌ Missing Cloudinary environment variables. Check your .env file.");
}

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'wanderlust_DEV', // Your Cloudinary folder
    resource_type: 'image',   // Restrict to images
    public_id: file.originalname.split('.')[0], // Optional: Custom filename
  }),
});

module.exports = { cloudinary, storage };
