import { RequestHandler } from 'express';
import validator from '../validator';
import { orderSchema } from './orderSchema';

export const processingOrderValidation: RequestHandler = (req, res, next) =>
  validator(orderSchema.processingOrder, { ...req.body }, next);

export const updateOrderStatusValidation: RequestHandler = (req, res, next) =>
  validator(orderSchema.updateOrderStatus, { ...req.body }, next);

export const createStripeCheckoutSessionValidation: RequestHandler = (req, res, next) =>
  validator(orderSchema.createStripeCheckoutSession, { ...req.body }, next);

export const orderIdValidation: RequestHandler = (req, res, next) => {
  return validator(orderSchema.validatedOrderId, { ...req.file, ...req.body, ...req.params }, next);
};
