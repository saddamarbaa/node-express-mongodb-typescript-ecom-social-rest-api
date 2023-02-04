import { NextFunction, Request, Response } from 'express';
import {
  AddCommentT,
  AuthenticatedRequestBody,
  IUser,
  PostT,
  TPaginationResponse,
  UpdateCommentT,
} from '@src/interfaces';
import {
  addCommentInPostService,
  createPostService,
  deleteAllCommentInPostService,
  deleteAllUserCommentInPostService,
  deleteCommentInPostService,
  deletePostService,
  deleteUserPostsService,
  getAllCommentInPostService,
  getAllUserCommentInPostService,
  getCommentInPostService,
  getPostService,
  getPostsService,
  getUserPostsService,
  likePostService,
  updateCommentInPostService,
  updatePostService,
} from '@src/services';

export const getPostsController = (req: Request, res: TPaginationResponse) => getPostsService(req, res);

export const getUserPostsController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getUserPostsService(req, res, next);

export const getPostController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getPostService(req, res, next);

export const createPostController = (req: AuthenticatedRequestBody<PostT>, res: Response, next: NextFunction) =>
  createPostService(req, res, next);

export const deletePostController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  deletePostService(req, res, next);

export const deleteUserPostsController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  deleteUserPostsService(req, res, next);

export const updatePostController = (req: AuthenticatedRequestBody<PostT>, res: Response, next: NextFunction) =>
  updatePostService(req, res, next);

export const likePostController = (req: AuthenticatedRequestBody<PostT>, res: Response, next: NextFunction) =>
  likePostService(req, res, next);

export const addCommentInPostController = (
  req: AuthenticatedRequestBody<AddCommentT>,
  res: Response,
  next: NextFunction
) => addCommentInPostService(req, res, next);

export const updateCommentInPostController = (
  req: AuthenticatedRequestBody<UpdateCommentT>,
  res: Response,
  next: NextFunction
) => updateCommentInPostService(req, res, next);

export const getCommentInPostController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getCommentInPostService(req, res, next);

export const getAllCommentInPostController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => getAllCommentInPostService(req, res, next);

export const getAllUserCommentInPostController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => getAllUserCommentInPostService(req, res, next);

export const deleteCommentInPostController = (
  req: AuthenticatedRequestBody<UpdateCommentT>,
  res: Response,
  next: NextFunction
) => deleteCommentInPostService(req, res, next);

export const deleteAllUserCommentInPostController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => deleteAllUserCommentInPostService(req, res, next);

export const deleteAllCommentInPostController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => deleteAllCommentInPostService(req, res, next);
