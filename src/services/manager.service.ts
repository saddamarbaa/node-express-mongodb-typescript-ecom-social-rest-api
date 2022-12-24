import { RequestHandler } from 'express';
import { InternalServerError } from 'http-errors';

import User from '@src/models/User.model';
import { authorizationRoles, customResponse } from '@src/utils';

export const managerGetUsersService: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find({ role: authorizationRoles.user });

    const data = {
      user: users || [],
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

export default managerGetUsersService;
