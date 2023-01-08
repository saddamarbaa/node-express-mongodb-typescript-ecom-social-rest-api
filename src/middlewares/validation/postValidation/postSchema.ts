import Joi from 'joi';

// @ts-ignore
import JoiObjectId from 'joi-objectid';

import { postCategory } from '@src/constants';

const vaildObjectId = JoiObjectId(Joi);

export const postSchema = {
  addPost: Joi.object({
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
    filename: Joi.string().required().label('Invalid request (Please upload Image)'),
  }),
  validatedPostId: Joi.object({
    postId: vaildObjectId().required(),
  }),
};
