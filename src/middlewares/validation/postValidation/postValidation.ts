import { RequestHandler } from 'express';
import validator from '../validator';
import { postSchema } from './postSchema';

export const addPostValidation: RequestHandler = (req, res, next) =>
  validator(postSchema.addPost, { ...req.file, ...req.body }, next);

export const postIdValidation: RequestHandler = (req, res, next) => {
  return validator(postSchema.validatedPostId, req.params, next);
};
