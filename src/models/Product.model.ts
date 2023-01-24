import mongoose, { Schema } from 'mongoose';

import { ProductT } from '@src/interfaces';
import { productCategory } from '@src/constants';

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
      required: [false, 'Please provide product image'],
      trim: true,
    },
    productImages: [
      {
        url: {
          type: String,
          required: true,
          trim: true,
        },
        cloudinary_id: {
          type: String,
          required: false,
        },
      },
    ],
    category: {
      type: String,
      enum: {
        values: [
          productCategory.womenClothe,
          productCategory.menClothe,
          productCategory.menShoe,
          productCategory.womenShoe,
          productCategory.toy,
          productCategory.football,
          productCategory.book,
          productCategory.PersonalComputer,
          productCategory.jewelery,
          productCategory.electronic,
          productCategory.sport,
          productCategory.all,
        ],
        message: `Please select category only from short listed option (${productCategory.all},
        ${productCategory.womenClothe},
          ${productCategory.menClothe},
          ${productCategory.menClothe},
          ${productCategory.womenShoe},
          ${productCategory.toy},
          ${productCategory.football},
          ${productCategory.book},
          ${productCategory.PersonalComputer},
          ${productCategory.jewelery},
          ${productCategory.electronic},
          ${productCategory.sport})`,
      },
      default: productCategory.all,
      trim: true,
      lowercase: true,
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
      default: 0,
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

ProductSchema.post('save', function () {
  if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
    console.log('Middleware called after saving the product is (product is been Save )', this);
  }
});

export default mongoose.models.Product || mongoose.model<ProductT>('Product', ProductSchema);
