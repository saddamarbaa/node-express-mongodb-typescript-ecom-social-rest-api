import jwt, { VerifyErrors } from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';

import User from '@src/models/User.model';
import { environmentConfig } from '@src/configs/custom-environment-variables.config';
import { IAuthRequest, IUser } from '@src/interfaces';

export const isAuth = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = (req && req.headers.authorization) || (req && req.headers.Authorization);
  const token = (authHeader && authHeader.split(' ')[1]) || req?.cookies?.authToken || req?.cookies?.accessToken || '';

  if (!token) {
    return next(createHttpError(401, 'Auth Failed (Invalid Credentials)'));
  }

  jwt.verify(
    token,
    environmentConfig.ACCESS_TOKEN_SECRET_KEY as jwt.Secret,
    async (err: VerifyErrors | null, decodedUser: any) => {
      if (err) {
        // JsonWebTokenError or token has expired
        const errorMessage = err.name === 'JsonWebTokenError' ? 'Auth Failed (Unauthorized)' : err.message;

        return next(createHttpError(403, errorMessage));
      }

      try {
        const decodedUserInDB = await User.findOne({ _id: decodedUser?.userId }).select('-password -confirmPassword');

        if (!decodedUserInDB) {
          return next(createHttpError(403, `Auth Failed (Unauthorized)`));
        }
        // console.log('The Authorized Admin is ', user);
        // req.user = user as IUser;
        req.user = decodedUserInDB as IUser;

        // if we did success go to the next middleware
        next();
      } catch (error) {
        return next(InternalServerError);
      }
    }
  );
};

export default { isAuth };
