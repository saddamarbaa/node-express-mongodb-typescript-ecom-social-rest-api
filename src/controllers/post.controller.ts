import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequestBody, PostT, TPaginationResponse } from '@src/interfaces';
import { createPostService, getPostsService } from '@src/services';

export const getPostsController = (req: Request, res: TPaginationResponse) => getPostsService(req, res);

export const createPostController = (req: AuthenticatedRequestBody<PostT>, res: Response, next: NextFunction) =>
  createPostService(req, res, next);
