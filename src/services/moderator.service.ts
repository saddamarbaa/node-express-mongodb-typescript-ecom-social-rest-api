import { RequestHandler } from 'express';
import { InternalServerError } from 'http-errors';

import User from '@src/models/User.model';
import { customResponse } from '@src/utils';
import { authorizationRoles } from '@src/constants';

export const moderatorGetUsersService: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find().select(['-password', '-confirmPassword']);

    const data = {
      user:
        users.filter((user) => user?.role === authorizationRoles.user || user?.role === authorizationRoles.client) ||
        [],
    };

    return res.status(200).json(
      customResponse<typeof data>({
        data,
        success: true,
        error: false,
        message: `Success`,
        status: 200,
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};
