import createHttpError from 'http-errors';
import { NextFunction, Response } from 'express';
import { IAuthRequest } from '@src/interfaces';

export const customRoles = (roles: string | undefined) => {
  return async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req?.user;
      if (user && roles && !roles.includes(`${user.role}`)) {
        return next(createHttpError(403, `Auth Failed (Unauthorized)`));
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
