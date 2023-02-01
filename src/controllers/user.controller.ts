import { Response, NextFunction } from 'express';

import { followUserService, unFollowUserService } from '@src/services';
import { AuthenticatedRequestBody, IUser } from '@src/interfaces';

export const followUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  followUserService(req, res, next);

export const unFollowUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  unFollowUserService(req, res, next);
