import mongoose from 'mongoose';

export interface CommentT {
  name: string;
  comment: string;
  user: mongoose.Schema.Types.ObjectId;
}

export interface LikeT {
  user: mongoose.Schema.Types.ObjectId;
}

export interface PostT extends mongoose.Document {
  title: string;
  content: string;
  postImage: string;
  author: mongoose.Schema.Types.ObjectId;
  numberOfLikes: number;
  comments: CommentT[];
  likes: LikeT[];
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
}
