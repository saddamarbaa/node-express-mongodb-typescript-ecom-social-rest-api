import mongoose, { Document } from 'mongoose';
import { IUser } from './User';

export interface ReviewsT {
  user: mongoose.Schema.Types.ObjectId;
  name: string;
  rating?: number;
  comment: string;
}

export interface ProductT extends Document {
  name: string;
  description: string;
  price: number;
  productImage: string;
  productImages: {
    url: string;
    cloudinary_id: string;
  }[];
  brand: string;
  category: string;
  stock?: string;
  numberOfReviews: number;
  reviews: ReviewsT[];
  ratings?: number;
  user: mongoose.Schema.Types.ObjectId;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddProductToCartT extends IUser {
  productId: string;
}
export interface ReviewProductT extends IUser {
  productId: string;
  rating: number;
  comment: string;
}
