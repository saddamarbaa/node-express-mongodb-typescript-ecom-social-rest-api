import mongoose from 'mongoose';

export interface CommentT extends mongoose.Document {
  comment: string;
  user: mongoose.Schema.Types.ObjectId;
}

export interface AddCommentT extends CommentT {
  postId: string;
}

export interface UpdateCommentT extends AddCommentT {
  commentId: string;
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
  cloudinary_id?: string;
}
