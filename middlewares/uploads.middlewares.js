import multer from "multer";
import path from "path";
import fs from "fs";

// Create folder if not exists
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Main upload directories
createFolder("uploads/thumbnails");
createFolder("uploads/videos");
createFolder("uploads/pdfs");
createFolder("uploads/others");

// Chat-specific directories
createFolder("uploads/chat/images");
createFolder("uploads/chat/audio");
createFolder("uploads/chat/docs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (/\.(jpeg|jpg|png|gif)$/i.test(ext)) {
      cb(null, "uploads/chat/images");
    } else if (/\.(mp3|wav|m4a|ogg)$/i.test(ext)) {
      cb(null, "uploads/chat/audio");
    } else if (/\.(pdf|doc|docx|txt)$/i.test(ext)) {
      cb(null, "uploads/chat/docs");
    } else if (file.fieldname === "thumbnail") {
      cb(null, "uploads/thumbnails");
    } else if (file.fieldname.startsWith("video")) {
      cb(null, "uploads/videos");
    } else if (file.fieldname.startsWith("pdf") || ext === ".pdf") {
      cb(null, "uploads/pdfs");
    } else {
      cb(null, "uploads/others");
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (/\.(jpeg|jpg|png|gif)$/i.test(ext)) cb(null, true);
  else if (/\.(mp4|mov|avi|mkv)$/i.test(ext)) cb(null, true);
  else if (/\.(pdf|doc|docx|txt)$/i.test(ext)) cb(null, true);
  else if (/\.(mp3|wav|m4a|ogg)$/i.test(ext)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB max
};

const upload = multer({ storage, fileFilter, limits });

// ✅ Middleware wrapper to add file URL
export const uploadWithUrl = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) return next(err);

      if (req.files) {
        Object.keys(req.files).forEach((key) => {
          req.files[key] = req.files[key].map((file) => {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            return {
              ...file,
              url: `${baseUrl}/uploads/${file.filename}`,
            };
          });
        });
      }

      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        req.file.url = `${baseUrl}/uploads/${req.file.filename}`;
      }

      next();
    });
  };
};

export default upload;
