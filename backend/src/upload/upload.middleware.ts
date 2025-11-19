import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export const uploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    // Check MIME type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
        ),
        false
      );
    }

    // Additional extension check
    const ext = extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov', '.avi'];
    
    if (!allowedExtensions.includes(ext)) {
      return callback(
        new BadRequestException(`Invalid file extension: ${ext}`),
        false
      );
    }

    callback(null, true);
  },
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Use max video size as overall limit
    files: 10, // Max 10 files per request
  },
};

export function validateFileSize(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    throw new BadRequestException(`Image file too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new BadRequestException(`Video file too large. Maximum size: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
  }
}

export function isImageFile(file: Express.Multer.File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.mimetype);
}

export function isVideoFile(file: Express.Multer.File): boolean {
  return ALLOWED_VIDEO_TYPES.includes(file.mimetype);
}

