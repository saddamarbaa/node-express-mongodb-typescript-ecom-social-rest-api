import mongoose, { Schema } from 'mongoose';

import { PostT } from '@src/interfaces';
import { postCategory } from '@src/constants';

export const PostSchema: Schema<PostT> = new Schema(
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
      minlength: 3,
      required: [true, 'Please provide post description'],
    },
    postImage: { type: String, required: true },
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
    numberOfLikes: {
      type: Number,
      required: false,
      default: 0,
    },
    comments: [
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
        comment: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Post || mongoose.model<PostT>('Post', PostSchema);
