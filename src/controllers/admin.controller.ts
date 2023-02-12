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
  adminGetOrdersService,
  adminGetOrderService,
  adminDeleteSingleOrderService,
  adminDeleteAllOrderForGivenUserService,
  adminClearAllOrdersService,
  adminGetAllOrdersForGivenUserService,
  adminUpdateOrderStatusService,
  adminGetPostsService,
  adminCreatePostService,
  adminGetPostService,
  adminDeletePostService,
  adminClearAllPostsService,
  adminUpdatePostService,
  adminDeleteAllPostForGivenUserService,
  adminClearAllProductsService,
  adminDeleteAllCommentInPostService,
  adminDeleteCommentInPostService,
} from '@src/services';
import {
  AuthenticatedRequestBody,
  IUser,
  IPost,
  ProcessingOrderT,
  ProductT,
  TPaginationResponse,
  UpdateCommentT,
} from '@src/interfaces';

export const adminUpdateOrderStatusController = (
  req: AuthenticatedRequestBody<ProcessingOrderT>,
  res: Response,
  next: NextFunction
) => adminUpdateOrderStatusService(req, res, next);

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

export const adminClearAllProductsController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminClearAllProductsService(req, res, next);

export const adminGetOrdersController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetOrdersService(req, res, next);

export const adminGetOrderController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetOrderService(req, res, next);

export const adminGetAllOrdersForGivenUserController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminGetAllOrdersForGivenUserService(req, res, next);

export const adminDeleteSingleOrderController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminDeleteSingleOrderService(req, res, next);

export const adminDeleteAllOrderForGivenUserController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminDeleteAllOrderForGivenUserService(req, res, next);

export const adminClearAllOrdersController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminClearAllOrdersService(req, res, next);

export const adminGetPostsController = (req: Request, res: TPaginationResponse) => adminGetPostsService(req, res);

export const adminGetPostController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetPostService(req, res, next);

export const adminCreatePostController = (req: AuthenticatedRequestBody<IPost>, res: Response, next: NextFunction) =>
  adminCreatePostService(req, res, next);

export const adminUpdatePostController = (req: AuthenticatedRequestBody<IPost>, res: Response, next: NextFunction) =>
  adminUpdatePostService(req, res, next);

export const adminDeletePostController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminDeletePostService(req, res, next);

export const adminDeleteAllPostForGivenUserController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminDeleteAllPostForGivenUserService(req, res, next);

export const adminDeleteAllCommentInPostController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminDeleteAllCommentInPostService(req, res, next);

export const adminDeleteCommentInPostController = (
  req: AuthenticatedRequestBody<UpdateCommentT>,
  res: Response,
  next: NextFunction
) => adminDeleteCommentInPostService(req, res, next);

export const adminClearAllPostsController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminClearAllPostsService(req, res, next);

export default adminGetUsersController;
