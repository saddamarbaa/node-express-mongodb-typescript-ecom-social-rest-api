import mongoose from 'mongoose';
import { IUser } from './User';

export interface CommentI extends mongoose.Document {
  comment: string;
  user: IUser['_id'];
}

export interface IShare {
  user: mongoose.Types.ObjectId;
}

export interface LikeT {
  user: mongoose.Types.ObjectId;
}

export interface AddCommentT extends CommentI {
  postId: string;
}

export interface UpdateCommentT extends AddCommentT {
  commentId: string;
}

export interface IPost extends mongoose.Document {
  title: string;
  content: string;
  postImage: string;
  author: IUser['_id'];
  user: IUser['_id'];
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  cloudinary_id?: string;
  likes: IUser['_id'][];
  disLikes: IUser['_id'][];
  views: IUser['_id'][];
  comments: CommentI[];
  // Virtual fields
  likesCount?: number;
  disLikesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  daysAgo?: string | null;
  likesPercentage?: string;
  disLikesPercentage?: string;
}
