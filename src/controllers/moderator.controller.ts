import { NextFunction, Request, Response } from 'express';

import { moderatorGetUsersService } from '@src/services/moderator.service';

export const moderatorGetUsersController = (req: Request, res: Response, next: NextFunction) =>
  moderatorGetUsersService(req, res, next);
