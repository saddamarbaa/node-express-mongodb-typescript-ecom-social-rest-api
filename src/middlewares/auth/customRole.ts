import { NextFunction, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';
import { IAuthRequest } from '@src/interfaces';

export const customRoles = (authorizationEmails: string | undefined, role: string) => {
  return async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req?.user;
      const parsedAuthorizationEmails = authorizationEmails && (JSON.parse(authorizationEmails) as string[]);

      const isAuth = user && user.role === role && parsedAuthorizationEmails?.includes(`${user?.email}`);

      if (!isAuth) {
        return next(createHttpError(403, `Auth Failed (Unauthorized)`));
      }
      next();
    } catch (error) {
      next(InternalServerError);
    }
  };
};
