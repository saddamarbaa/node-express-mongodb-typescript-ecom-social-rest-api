import { NextFunction, Request, Response } from 'express';

import { AddProductToCartT, AuthenticatedRequestBody, IUser, TPaginationResponse } from '@src/interfaces';
import {
  addProductToCartService,
  clearCartService,
  deleteProductFromCartService,
  getCartService,
  getProductService,
  getProductsService,
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

export const getCartController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getCartService(req, res, next);

export const clearCartController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  clearCartService(req, res, next);

export default {
  getProductsController,
};
