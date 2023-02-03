import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequestBody, IUser, PostT, TPaginationResponse } from '@src/interfaces';
import {
  createPostService,
  deletePostService,
  deleteUserPostsService,
  getPostService,
  getPostsService,
  getUserPostsService,
  likePostService,
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
