import mongoose from 'mongoose';
import { environmentConfig } from '@src/configs';
import { productCategory } from './product';

export const cloudinaryResponse = {
  secure_url: 'https://res.cloudinary.com/decjnna6h/image/upload/v1674051312/users/vbbon1tejm74rq3bjspj.jpg',
  public_id: 'users/vbbon1tejm74rq3bjspj',
};

export const correctFilePath = `${process.env.PWD}/public/tests/test.jpeg`;
export const invaildFileType = `${process.env.PWD}/public/tests/test.pdf`;

export const validMongooseObjectId = new mongoose.Types.ObjectId().toString();

export const userPayload = {
  name: 'test',
  surname: 'test',
  email: 'testverstmion@gmail.com',
  password: '12345test',
  confirmPassword: '12345test',
  acceptTerms: true,
  profileImage: cloudinaryResponse.secure_url,
  cloudinary_id: cloudinaryResponse.public_id,
  isVerified: true,
  status: 'active',
};

export const productPayload = {
  name: 'clean architecture',
  price: 99,
  brand: 'Rest Api',
  description: 'clean architecture typescript express api book',
  productImages: [
    {
      url: 'https://res.cloudinary.com/decjnna6h/image/upload/v1674091331/products/p9lxfxfb4siog73x3bbq.jpg',
      cloudinary_id: 'products/p9lxfxfb4siog73x3bbq',
    },
  ],
  category: productCategory.book,
};

export const adminEmails = environmentConfig?.ADMIN_EMAILS && (JSON.parse(environmentConfig.ADMIN_EMAILS) as string[]);

export const testPayload = {
  name: 'test',
  surname: 'test',
  email: 'testverstmion@gmail.com',
  password: '12345test',
  confirmPassword: '12345test',
  cart: { items: [] },
  companyName: 'test company',
  dateOfBirth: '09/10/1984',
  mobileNumber: '+62213147666',
  gender: 'male',
  profileImage: 'https://res.cloudinary.com/decjnna6h/image/upload/v1674051312/users/vbbon1tejm74rq3bjspj.jpg',
  cloudinary_id: 'users/vbbon1tejm74rq3bjspj',
  favoriteAnimal: 'cat',
  nationality: 'sudan',
  isVerified: true,
  isDeleted: false,
  status: 'active',
  bio: 'software engineer experienced in developing full-stack javascript/typescript application primarily with react/next/redux and node/express server design',
  jobTitle: 'software engineering',
  address: '12345test home batam indonesia',
  acceptTerms: true,
};

export const postPayload = {
  title: 'title',
  content: 'content',
  postImage: 'https://res.cloudinary.com/decjnna6h/image/upload/v1674051312/users/vbbon1tejm74rq3bjspj.jpg',
};
