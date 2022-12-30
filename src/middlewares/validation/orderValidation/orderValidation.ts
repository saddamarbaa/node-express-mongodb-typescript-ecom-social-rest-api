import { RequestHandler } from 'express';
import validator from '../validator';
import { orderSchema } from './orderSchema';

export const processingOrderValidation: RequestHandler = (req, res, next) =>
  validator(orderSchema.processingOrder, { ...req.body }, next);

export const updateOrderStatusValidation: RequestHandler = (req, res, next) =>
  validator(orderSchema.updateOrderStatus, { ...req.body }, next);
