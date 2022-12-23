import { NextFunction, Request, Response } from 'express';
import { managerGetUsersService } from '@src/services';

export const managerGetUsersController = (req: Request, res: Response, next: NextFunction) =>
  managerGetUsersService(req, res, next);

export default managerGetUsersController;
