import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

createFolder('uploads/thumbnails');
createFolder('uploads/videos');
createFolder('uploads/pdfs');
createFolder('uploads/others');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails');
    } else if (file.fieldname.startsWith('video')) {
      cb(null, 'uploads/videos');
    } else if (file.fieldname.startsWith('pdf')) {
      cb(null, 'uploads/pdfs');
    } else {
      cb(null, 'uploads/others');
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png/;
  const allowedVideo = /mp4|mov|avi|mkv/;
  const allowedPdf = /\.pdf$/i;
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'thumbnail') {
    cb(null, allowedImage.test(ext));
  } else if (file.fieldname.startsWith('video')) {
    cb(null, allowedVideo.test(ext));
  } else if (file.fieldname.startsWith('pdf')) {
    cb(null, allowedPdf.test(ext));
  } else {
    cb(null, false);
  }
};

const limits = {
  fileSize: 1 * 1024 * 1024 * 1024 // 1GB
};

const videoFields = Array.from({ length: 50 }, (_, i) => ({
  name: `video-${i}`,
  maxCount: 1
}));

const pdfFields = Array.from({ length: 50 }, (_, i) => ({
  name: `pdf-${i}`,
  maxCount: 1
}));

const fieldsConfig = [
  { name: 'thumbnail', maxCount: 1 },
  ...videoFields,
  ...pdfFields
];

export default multer({ storage, fileFilter, limits }).fields(fieldsConfig);
