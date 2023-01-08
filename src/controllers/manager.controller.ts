import { NextFunction, Request, Response } from 'express';

import { managerGetOrdersService, managerGetPostsService, managerGetUsersService } from '@src/services';

import { AuthenticatedRequestBody, IUser, TPaginationResponse } from '@src/interfaces';

export const managerGetUsersController = (req: Request, res: Response, next: NextFunction) =>
  managerGetUsersService(req, res, next);

export const managerGetOrdersController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  managerGetOrdersService(req, res, next);

export const managerGetPostsController = (req: Request, res: TPaginationResponse) => managerGetPostsService(req, res);

export default managerGetUsersController;
