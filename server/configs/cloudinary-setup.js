const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

var storage =  cloudinaryStorage({
  cloudinary,
  folder: "project-mg-gallery", // The name of the folder in cloudinary
  allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
  // params: { resource_type: 'raw' }, => this is in case you want to upload other type of files, not just images
  //transformation: [{ width: 120, height: 90, crop: 'fill' }],
  filename: function (req, res, cb) {
    let fileName = res.originalname.split(".");
    cb(null, fileName[0]); // The file on cloudinary would have the same name as the original file name
  },
});

const uploader = multer({ storage });
module.exports = uploader;
