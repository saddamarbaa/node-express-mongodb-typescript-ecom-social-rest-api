import mongoose, { Schema } from 'mongoose';

import { ProductT } from '@src/interfaces';

export const ProductSchema: Schema<ProductT> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      maxLength: 100,
      minlength: 3,
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
    },
    brand: {
      type: String,
      required: [true, 'Please product brand'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      // maxLength: 500,
      minlength: 15,
      trim: true,
      lowercase: true,
    },
    productImage: {
      type: String,
      required: [true, 'Please provide product image'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "Women's clothing",
          "Men's clothing",
          "Men's Shoes",
          "Women's Shoes",
          'Toys',
          'Football',
          'Books',
          'Personal Computers',
          'Jewelery',
          'Electronics',
          'Sports',
          'All Products',
        ],
        message: `Please select category only from short listed option ("Women's clothing",
          "Men's clothing",
          "Men's Shoes",
          "Women's Shoes",
          'Toys',
          'Football',
          'Books',
          'Personal Computers',
          'Jewelery',
          'Electronics',
          'Sports',
          'All Products',)`,
      },
      default: 'All Products',
      trim: true,
      required: [true, 'Category is required please select one'],
    },
    stock: {
      type: String,
      required: false,
      maxLength: 50,
      minlength: 3,
      trim: true,
      lowercase: true,
      default: 'in stock - order soon',
    },
    numberOfReviews: {
      type: Number,
      required: false,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // add relationship
          required: [true, 'User is required'],
        },
        name: {
          type: String,
          required: [true, ''],
          trim: true,
          lowercase: true,
        },
        rating: {
          type: Number,
          required: false,
          default: 0,
        },
        comment: {
          type: String,
          required: false,
        },
      },
    ],
    ratings: {
      type: Number,
      required: false,
      maxLength: 5,
      trim: true,
      lowercase: true,
      default: 1,
    },
    user: {
      // every products shuold blong to user
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // add relationship
      required: [true, 'User is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Product || mongoose.model<ProductT>('Product', ProductSchema);
