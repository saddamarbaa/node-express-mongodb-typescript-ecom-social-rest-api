import { NextFunction, Request, Response } from 'express';
import {
  adminAddProductService,
  adminAddUserService,
  adminDeleteProductService,
  adminGetProductService,
  adminGetProductsService,
  adminGetUserService,
  adminGetUsersService,
  adminUpdateProductService,
  removeAuthService,
  adminUpdateAuthService,
} from '@src/services';
import { AuthenticatedRequestBody, IUser, ProductT, TPaginationResponse } from '@src/interfaces';

export const adminGetUsersController = (req: Request, res: TPaginationResponse) => adminGetUsersService(req, res);

export const adminGetUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetUserService(req, res, next);

export const adminAddUserController = (req: Request, res: Response, next: NextFunction) =>
  adminAddUserService(req, res, next);

export const adminUpdateAuthController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminUpdateAuthService(req, res, next);

export const adminRemoveUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  removeAuthService(req, res, next);

export const adminGetProductsController = (req: Request, res: TPaginationResponse) => adminGetProductsService(req, res);

export const adminGetProductController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetProductService(req, res, next);

export const adminAddProductController = (req: AuthenticatedRequestBody<ProductT>, res: Response, next: NextFunction) =>
  adminAddProductService(req, res, next);

export const adminUpdateProductController = (
  req: AuthenticatedRequestBody<ProductT>,
  res: Response,
  next: NextFunction
) => adminUpdateProductService(req, res, next);

export const adminDeleteProductController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminDeleteProductService(req, res, next);

export default adminGetUsersController;
