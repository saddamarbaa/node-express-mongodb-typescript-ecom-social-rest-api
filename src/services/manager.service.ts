import { NextFunction, Request, RequestHandler, Response } from 'express';
import { InternalServerError } from 'http-errors';

import User from '@src/models/User.model';
import Order from '@src/models/Order.model';
import { AuthenticatedRequestBody, IUser, TPaginationResponse } from '@src/interfaces';
import { customResponse } from '@src/utils';
import { authorizationRoles } from '@src/constants';

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

export const managerGetPostsService = async (_req: Request, res: TPaginationResponse) => {
  if (res?.paginatedResults) {
    const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;
    const responseObject: any = {
      totalDocs: totalDocs || 0,
      totalPages: totalPages || 0,
      lastPage: lastPage || 0,
      count: results?.length || 0,
      currentPage: currentPage || 0,
    };

    if (next) {
      responseObject.nextPage = next;
    }
    if (previous) {
      responseObject.prevPage = previous;
    }

    responseObject.posts = results
      ?.map((postDoc: any) => {
        const { author, ...otherPostInfo } = postDoc._doc;
        return {
          ...otherPostInfo,
          creator: author,
          request: {
            type: 'Get',
            description: 'Get one post with the id',
            url: `${process.env.API_URL}/api/${process.env.API_VERSION}/feed/posts/${postDoc._doc._id}`,
          },
        };
      })
      .filter((post: any) => post.creator.role === authorizationRoles.user);

    return res.status(200).send(
      customResponse<typeof responseObject>({
        success: true,
        error: false,
        message: responseObject.posts.length ? 'Successful Found posts' : 'No post found',
        status: 200,
        data: responseObject,
      })
    );
  }
};

export default managerGetUsersService;
