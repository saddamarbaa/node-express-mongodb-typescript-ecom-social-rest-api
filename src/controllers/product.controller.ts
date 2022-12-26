import { NextFunction, Request, Response } from 'express';

import {
  AddProductToCartT,
  AuthenticatedRequestBody,
  IUser,
  ReviewProductT,
  TPaginationResponse,
} from '@src/interfaces';
import {
  addProductToCartService,
  addReviewService,
  clearCartService,
  deleteProductFromCartService,
  deleteReviewService,
  getCartService,
  getProductService,
  getProductsService,
  getReviewsService,
} from '@src/services';

export const getProductsController = (req: Request, res: TPaginationResponse) => getProductsService(req, res);

export const getProductController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getProductService(req, res, next);

export const addProductToCartController = (
  req: AuthenticatedRequestBody<AddProductToCartT>,
  res: Response,
  next: NextFunction
) => addProductToCartService(req, res, next);

export const deleteProductFromCartController = (
  req: AuthenticatedRequestBody<AddProductToCartT>,
  res: Response,
  next: NextFunction
) => deleteProductFromCartService(req, res, next);

export const addReviewController = (req: AuthenticatedRequestBody<ReviewProductT>, res: Response, next: NextFunction) =>
  addReviewService(req, res, next);

export const deleteReviewController = (
  req: AuthenticatedRequestBody<ReviewProductT>,
  res: Response,
  next: NextFunction
) => deleteReviewService(req, res, next);

export const getReviewsController = (
  req: AuthenticatedRequestBody<ReviewProductT>,
  res: Response,
  next: NextFunction
) => getReviewsService(req, res, next);

export const getCartController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getCartService(req, res, next);

export const clearCartController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  clearCartService(req, res, next);

export default {
  getProductsController,
};
