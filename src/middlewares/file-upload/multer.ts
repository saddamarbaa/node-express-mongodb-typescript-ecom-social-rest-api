import { Request, Express } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import createHttpError from 'http-errors';

import { getImageExtension } from '@src/utils';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

// Set Storage Engine
// Configuring and validating the upload
export const fileStorage = multer.diskStorage({
  destination: (request: Request, file: Express.Multer.File, callback: DestinationCallback): void => {
    // eslint-disable-next-line no-nested-ternary
    const fileName = request.originalUrl.includes('products')
      ? 'products'
      : request.originalUrl.includes('posts') || request.originalUrl.includes('feed')
      ? 'posts'
      : 'users';
    callback(null, `public/uploads/${fileName}`);
  },

  filename: (req: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
    if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
      console.log(file);
    }
    const imageExtension = getImageExtension(file.mimetype);
    if (!imageExtension) {
      // @ts-ignore
      callback(createHttpError(422, 'Invalid request (File type is not supported)'), false);
      return;
    }
    callback(null, `${file.fieldname}-${uuidv4()}${imageExtension}`);
  },
});

// Initialize upload variable
export const uploadImage = multer({
  // storage: multer.memoryStorage(),
  storage: fileStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // accept files up 10 mgb
  },
});

export const customMulterConfig = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 1024 * 1024 * 10, // accept files up 10 mgb
  },
  fileFilter: (request: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    if (!getImageExtension(file.mimetype)) {
      // @ts-ignore
      callback(createHttpError(422, 'Invalid request (File type is not supported)'), false);
      return;
    }
    callback(null, true);
  },
});

export default { uploadImage };
