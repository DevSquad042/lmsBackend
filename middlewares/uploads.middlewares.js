<<<<<<< HEAD
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload folders exist
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
=======
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload folders exist
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
>>>>>>> b72d206c63133f0353d9e8f261b426f5990eac14
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
<<<<<<< HEAD
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
=======
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
>>>>>>> b72d206c63133f0353d9e8f261b426f5990eac14
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png/;
  const allowedVideo = /mp4|mov|avi|mkv/;
<<<<<<< HEAD

  const ext = path.extname(file.originalname).toLowerCase();
=======
  const allowedPdf = /\.pdf$/i;

  const ext = path.extname(file.originalname).toLowerCase();

>>>>>>> b72d206c63133f0353d9e8f261b426f5990eac14
  if (file.fieldname === 'thumbnail') {
    cb(null, allowedImage.test(ext));
  } else if (file.fieldname === 'video') {
    cb(null, allowedVideo.test(ext));
<<<<<<< HEAD
  } else {
    cb(null, false);
=======
  } else if (file.fieldname === 'pdf') {
    cb(null, allowedPdf.test(ext));
  } else {
    cb(null, false); // reject other fields or files
>>>>>>> b72d206c63133f0353d9e8f261b426f5990eac14
  }
};

// File size limits (image: 2MB, video: 100MB)
const limits = {
<<<<<<< HEAD
  fileSize: 100 * 1024 * 1024 // 100MB max per file
};

module.exports = multer({ storage, fileFilter, limits });
=======
  fileSize: 1 * 1024 * 1024 * 1024, // 100MB max per file
};

export default multer({ storage, fileFilter, limits });
>>>>>>> b72d206c63133f0353d9e8f261b426f5990eac14
