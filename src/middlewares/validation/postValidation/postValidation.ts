import { RequestHandler } from 'express';
import validator from '../validator';
import { postSchema } from './postSchema';

export const addPostValidation: RequestHandler = (req, res, next) => {
  return validator(
    postSchema.addPost,
    {
      ...req.file,
      ...req.body,
    },
    next
  );
};
export const updatePostValidation: RequestHandler = (req, res, next) =>
  validator(postSchema.updatePost, { ...req.file, ...req.body, ...req.params }, next);

export const postIdValidation: RequestHandler = (req, res, next) => {
  return validator(postSchema.validatedPostId, { ...req.file, ...req.body, ...req.params }, next);
};

export const commentIdValidation: RequestHandler = (req, res, next) => {
  return validator(postSchema.validatedCommentId, { ...req.file, ...req.body, ...req.params }, next);
};

export const addCommentValidation: RequestHandler = (req, res, next) =>
  validator(postSchema.addComment, { ...req.file, ...req.body, ...req.params }, next);

export const updateCommentValidation: RequestHandler = (req, res, next) => {
  return validator(postSchema.updateComment, { ...req.file, ...req.body, ...req.params }, next);
};

export const deleteCommentValidation: RequestHandler = (req, res, next) => {
  return validator(postSchema.deleteComment, { ...req.file, ...req.body, ...req.params }, next);
};
