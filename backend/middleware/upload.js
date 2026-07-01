import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import config from '../config/index.js';
import { MAX_COVER_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_MIMETYPES } from '../../shared/constants/index.js';

// Ensure upload directory exists locally
const uploadDir = config.uploadPath || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure local disk storage for Multer.
 * Generates unique, sanitized filenames for uploaded cover images.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cover-${uniqueSuffix}${ext}`);
  },
});

/**
 * Filters uploaded files to ensure only supported image formats are accepted.
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

/**
 * Configured Multer middleware instance.
 * Restricts file size to 5MB and validates image mimetypes.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_COVER_IMAGE_SIZE_BYTES,
  },
});

export default upload;
