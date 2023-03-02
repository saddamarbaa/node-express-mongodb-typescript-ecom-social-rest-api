import { Request } from 'express';
import { Document } from 'mongoose';
import { IPost } from './Post';

export interface FollowT {
  name: string;
  surname: string;
  profileImage?: string;
  bio?: string;
  userId?: string;
}
export interface IUser extends Document {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  acceptTerms: boolean;
  mobileNumber?: string;
  bio?: string;
  favoriteAnimal?: string;
  nationality?: string;
  companyName?: string;
  profileImage?: string;
  coverPicture?: string;
  jobTitle?: string;
  status?: string;
  isVerified?: boolean;
  isDeleted?: boolean;
  isBlocked?: boolean;
  address?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
  emailVerificationLinkToken?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  gender?: string;
  confirmationCode?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  userId?: string;
  userAward?: string;
  plan?: string;
  timestamps?: boolean;
  cart?: {
    items: {
      productId: string;
      quantity: number;
    }[];
  };
  cloudinary_id?: string;
  followers: string[];
  following: string[];
  friends: string[];
  viewers: string[];
  blocked: string[];
  // Virtual fields
  lastPostDate?: string;
  isInactive?: boolean;
  fullName?: string;
  followersCount?: number;
  followingCount?: number;
  viewersCount?: number;
  blockedCount?: number;
  friendsCount?: number;
  posts?: IPost[];
}

export interface IRequestUser extends Request {
  user: IUser;
}

export interface IAuthRequest extends Request {
  headers: { authorization?: string; Authorization?: string };
  cookies: { authToken?: string; accessToken?: string; refreshToken?: string };
  user?: IUser;
}

export type CartItemT = {
  productId: string;
  quantity: number;
};
