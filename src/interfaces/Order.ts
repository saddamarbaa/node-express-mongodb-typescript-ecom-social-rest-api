import mongoose, { Document } from 'mongoose';
import { IUser } from './User';

export interface OrderedUser extends IUser {
  product: mongoose.Schema.Types.ObjectId;
}

export interface ShippingInfoT {
  address: string;
  phoneNo: string;
  zipCode: string;
  status: string;
  country: string;
}

export interface OrderT extends Document {
  orderItems: { quantity: number; product: mongoose.Schema.Types.ObjectId }[];
  user: OrderedUser;
  shippingInfo: ShippingInfoT;
  paymentInfo: string;
  textAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderStatus: string;
  deliveredAt: Date;
}

export interface ProcessingOrderT extends IUser, OrderT {}
