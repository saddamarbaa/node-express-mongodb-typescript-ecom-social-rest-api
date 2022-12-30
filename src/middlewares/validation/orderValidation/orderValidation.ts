import { RequestHandler } from 'express';
import validator from '../validator';
import { orderSchema } from './orderSchema';

export const processingOrderValidation: RequestHandler = (req, res, next) =>
  validator(orderSchema.processingOrder, { ...req.body }, next);
