import mongoose, { Document } from 'mongoose';
import { IUser } from './User';

export interface OrderedUser extends IUser {
  product: mongoose.Schema.Types.ObjectId;
}

export interface OrderT extends Document {
  products: { quantity: number; product: mongoose.Schema.Types.ObjectId }[];
  user: OrderedUser;
}
