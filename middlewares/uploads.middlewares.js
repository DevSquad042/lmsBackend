const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload folders exist
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

createFolder('uploads/thumbnails');
createFolder('uploads/videos');

// Storage config (dynamic destination based on field name)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isVideo = file.fieldname === 'video';
    cb(null, isVideo ? 'uploads/videos' : 'uploads/thumbnails');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png/;
  const allowedVideo = /mp4|mov|avi|mkv/;

  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'thumbnail') {
    cb(null, allowedImage.test(ext));
  } else if (file.fieldname === 'video') {
    cb(null, allowedVideo.test(ext));
  } else {
    cb(null, false);
  }
};

// File size limits (image: 2MB, video: 100MB)
const limits = {
  fileSize: 100 * 1024 * 1024 // 100MB max per file
};

module.exports = multer({ storage, fileFilter, limits });
