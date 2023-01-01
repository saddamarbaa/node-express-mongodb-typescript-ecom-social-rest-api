import { NextFunction, RequestHandler, Response } from 'express';
import { InternalServerError } from 'http-errors';

import User from '@src/models/User.model';
import Order from '@src/models/Order.model';

import { customResponse } from '@src/utils';
import { authorizationRoles } from '@src/constants';
import { AuthenticatedRequestBody, IUser } from '@src/interfaces';

export const managerGetUsersService: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find({ role: authorizationRoles.user }, '-password -confirmPassword');

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

export const managerGetOrdersService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find()
      .populate('user.userId', '-password -confirmPassword')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'user', select: '-password -confirmPassword' },
      })
      .exec();
    const managerOrders = orders?.filter((order) => order?.user?.userId?.role === authorizationRoles.user);

    const data = {
      orders: managerOrders,
    };

    return res.status(200).send(
      customResponse<typeof data>({
        success: true,
        error: false,
        message: `Successful Found all orders`,
        status: 200,
        data,
      })
    );
  } catch (error) {
    return next(error);
  }
};

export default managerGetUsersService;
