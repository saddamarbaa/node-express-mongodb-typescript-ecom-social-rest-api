import mongoose, { Schema, CallbackError } from 'mongoose';

import { awards, postCategory } from '@src/constants';
import { IPost, IUser } from '@src/interfaces';
import { UserSchema } from './User.model';

const PostSchema: Schema<IPost> = new Schema<IPost>(
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
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
      },
    ],
    disLikes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
      },
    ],
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PostSchema.post('save', async function (this: IPost, doc, next) {
  try {
    if (process?.env?.NODE_ENV && process.env.NODE_ENV === 'development') {
      console.log('New post is been added', this);
    }

    const posts = (await mongoose
      .model<IPost>('Post', PostSchema)
      .find({ author: this.author.toString() })) as unknown as IPost[];

    // get the last post created by the user
    const lastPost = posts[posts.length - 1];

    // get the last post date
    const lastPostDate = lastPost ? new Date(lastPost.createdAt as string) : undefined;
    // get the last post date in string format
    const lastPostDateStr = lastPostDate ? lastPostDate.toDateString() : undefined;

    // add virtuals to the schema
    UserSchema.virtual('lastPostDate').get(function (this: IUser) {
      return lastPostDateStr;
    });

    // get the number of posts
    const numberOfPosts = posts.length;

    // update user award based on the number of posts
    let award: string;
    if (numberOfPosts <= 10) {
      award = awards.bronze;
    } else if (numberOfPosts <= 20) {
      award = awards.silver;
    } else {
      award = awards.gold;
    }

    // update the user award in the database
    await mongoose
      .model<IUser>('User', UserSchema)
      .findByIdAndUpdate(this.author.toString(), { userAward: award }, { new: true });

    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

// Hook
// add likes count as virtual field
PostSchema.virtual('likesCount').get(function (this: IPost) {
  return this?.likes?.length;
});

// add dislikes count as virtual field
PostSchema.virtual('disLikesCount').get(function (this: IPost) {
  return this?.disLikes?.length;
});

// add views count as virtual field
PostSchema.virtual('viewsCount').get(function (this: IPost) {
  return this?.views?.length;
});

// add comments count as virtual field
PostSchema.virtual('commentsCount').get(function (this: IPost) {
  return this?.comments?.length;
});

// Define a virtual property for a post document that calculates how many days ago the post was created
PostSchema.virtual('daysAgo').get(function (this: IPost) {
  // Get the date the post was created
  const date: Date | undefined = this.createdAt ? new Date(this.createdAt) : undefined;

  // Calculate how many days ago the post was created
  const daysAgo: number | null = date ? Math.floor((Date.now() - date.getTime()) / 86400000) : null;

  // Return a string indicating how many days ago the post was created, or 'Unknown' if the creation date is missing
  if (daysAgo === null) {
    return 'Unknown';
  }
  if (daysAgo === 0) {
    return 'Today';
  }
  if (daysAgo === 1) {
    return 'Yesterday';
  }
  return `${daysAgo} days ago`;
});

// check the most liked post in percentage
PostSchema.virtual('likesPercentage').get(function (this: IPost) {
  const total = Number(this.likes.length) + Number(this.disLikes.length);
  const percentage = (this.likes.length / total) * 100 || 0;
  return `${percentage}%`;
});

// check the most disliked post in percentage
PostSchema.virtual('disLikesPercentage').get(function (this: IPost) {
  const total = Number(this.likes.length) + Number(this.disLikes.length);
  const percentage = (this.disLikes.length / total) * 100 || 0;
  return `${percentage}%`;
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
