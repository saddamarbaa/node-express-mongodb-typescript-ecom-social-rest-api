import { RequestHandler } from 'express';
import validator from '../validator';
import { productSchema } from './productSchema';

export const addProductValidation: RequestHandler = (req, res, next) =>
  validator(productSchema.addProduct, { ...req.file, ...req.body }, next);

export const updateProductValidation: RequestHandler = (req, res, next) =>
  validator(productSchema.updateProduct, { ...req.file, ...req.body }, next);
