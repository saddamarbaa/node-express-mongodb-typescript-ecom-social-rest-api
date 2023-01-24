import Cloudinary from 'cloudinary';

import { environmentConfig } from '@src/configs';

export const cloudinary = Cloudinary.v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: environmentConfig.CLOUDINARY_CLOUD_NAME,
  api_key: environmentConfig.CLOUDINARY_API_KEY,
  api_secret: environmentConfig.CLOUDINARY_API_SECRET,
});

export default cloudinary;
