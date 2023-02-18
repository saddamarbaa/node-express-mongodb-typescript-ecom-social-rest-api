import Joi from 'joi';

// @ts-ignore
import JoiObjectId from 'joi-objectid';

import { postCategory } from '@src/constants';

const vaildObjectId = JoiObjectId(Joi);

export const postSchema = {
  addPost: Joi.object({
    filename: Joi.string().required().label('Invalid request (Please upload Image)'),
    title: Joi.string().min(3).max(100).required(),
    content: Joi.string().min(5).required(),
    category: Joi.string().valid(
      postCategory.blockchain,
      postCategory.coding,
      postCategory.devApp,
      postCategory.nextjs,
      postCategory.nodejs,
      postCategory.reactjs,
      postCategory.sports,
      postCategory.typeScript,
      postCategory.social
    ),
  }),
  updatePost: Joi.object({
    title: Joi.string().min(3).max(100),
    content: Joi.string().min(5),
    postId: vaildObjectId().required(),
    category: Joi.string().valid(
      postCategory.blockchain,
      postCategory.coding,
      postCategory.devApp,
      postCategory.nextjs,
      postCategory.nodejs,
      postCategory.reactjs,
      postCategory.sports,
      postCategory.typeScript,
      postCategory.social
    ),
    filename: Joi.string().label('Invalid request (Please upload Image)'),
  }),
  addComment: Joi.object({
    comment: Joi.string().min(3).max(300).required(),
    postId: vaildObjectId().required(),
  }),
  updateComment: Joi.object({
    comment: Joi.string().min(3).max(300).required(),
    postId: vaildObjectId().required(),
    commentId: vaildObjectId().required(),
  }),
  deleteComment: Joi.object({
    postId: vaildObjectId().required(),
    commentId: vaildObjectId().required(),
  }),
  validatedPostId: Joi.object({
    postId: vaildObjectId().required(),
  }),
  validatedCommentId: Joi.object({
    commentId: vaildObjectId().required(),
  }),
};
