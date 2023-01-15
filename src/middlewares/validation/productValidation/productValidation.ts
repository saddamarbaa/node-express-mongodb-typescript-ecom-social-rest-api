import { RequestHandler } from 'express';
import validator from '../validator';
import { productSchema } from './productSchema';

export const addProductValidation: RequestHandler = (req, res, next) => {
  return validator(
    productSchema.addProduct,
    {
      productImages: req.files,
      ...req.body,
    },
    next
  );
};

export const updateProductValidation: RequestHandler = (req, res, next) => {
  return validator(
    productSchema.updateProduct,
    {
      ...req.params,
      productImages: req.files,
      ...req.body,
    },
    next
  );
};

export const reviewProductValidation: RequestHandler = (req, res, next) =>
  validator(productSchema.reviewProduct, { ...req.body }, next);

export const productIdValidation: RequestHandler = (req, res, next) =>
  validator(productSchema.validatedProductId, { ...req.body, ...req.params }, next);
