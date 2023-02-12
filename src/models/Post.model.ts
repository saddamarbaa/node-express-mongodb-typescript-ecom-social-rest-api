import mongoose, { Schema } from 'mongoose';

import { postCategory } from '@src/constants';
import { IPost } from '@src/interfaces';

export const PostSchema: Schema<IPost> = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide title'],
      maxLength: 100,
      minlength: 3,
    },
    content: {
      type: String,
      trim: true,
      minlength: 5,
      required: [true, 'Please provide post description'],
    },
    postImage: { type: String, required: true },
    cloudinary_id: {
      type: String,
    },
    author: {
      // every post shuold blong to user
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // add relationship
      required: [true, 'author is required'],
    },
    category: {
      type: String,
      enum: {
        values: [
          postCategory.blockchain,
          postCategory.coding,
          postCategory.devApp,
          postCategory.nextjs,
          postCategory.nodejs,
          postCategory.reactjs,
          postCategory.sports,
          postCategory.typeScript,
          postCategory.social,
        ],
        message: `Please select category only from short listed option  
         ${postCategory.typeScript},
        ${postCategory.sports},
          ${postCategory.reactjs},
          ${postCategory.nodejs},
          ${postCategory.nextjs},
          ${postCategory.devApp},
          ${postCategory.coding},
          ${postCategory.blockchain},
           ${postCategory.social},
          )`,
      },
      default: postCategory.social,
      trim: true,
      lowercase: true,
      required: true,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // add relationship
          required: [true, 'User is required'],
        },
      },
    ],
    comments: [
      {
        comment: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // add relationship
          required: [true, 'User is required'],
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
