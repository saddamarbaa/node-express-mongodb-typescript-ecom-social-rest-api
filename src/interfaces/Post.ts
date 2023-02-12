import mongoose from 'mongoose';

export interface CommentI extends mongoose.Document {
  comment: string;
  user: mongoose.Types.ObjectId;
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
  author: mongoose.Types.ObjectId;
  comments: CommentI[];
  likes: LikeT[];
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  cloudinary_id?: string;
}
