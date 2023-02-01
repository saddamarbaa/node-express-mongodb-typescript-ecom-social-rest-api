import { NextFunction, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';

import User from '@src/models/User.model';

import { AuthenticatedRequestBody, FollowT, IUser } from '@src/interfaces';
import { customResponse } from '@src/utils';

export const followUserService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    if (req.user?._id.equals(req.params.userId)) {
      return next(createHttpError(403, `You cant follow yourself`));
    }

    const toBeFollowedUser = await User.findById(req.params.userId);
    if (!toBeFollowedUser) {
      return next(new createHttpError.BadRequest());
    }

    const currentUser = await User.findById(req.user?._id);

    const isAlreadyFollowed = toBeFollowedUser.followers.some(function (user: FollowT) {
      if (user.userId?.toString() === currentUser._id.toString()) return true;
      return false;
    });

    if (!isAlreadyFollowed) {
      await toBeFollowedUser.updateOne({
        $push: {
          followers: {
            userId: currentUser?._id,
            name: currentUser?.name,
            surname: currentUser?.surname,
            profileImage: currentUser?.profileImage,
          },
        },
        new: true,
      });

      await currentUser.updateOne({
        $push: {
          followings: {
            userId: req.params.userId,
            name: toBeFollowedUser?.name,
            surname: toBeFollowedUser?.surname,
            profileImage: toBeFollowedUser?.profileImage,
          },
        },
      });

      const updatedUser = await User.findById(req.user?._id)
        .select('-password -confirmPassword -cloudinary_id -status -isDeleted -acceptTerms -isVerified')
        .populate('cart.items.productId')
        .exec();

      return res.status(200).send(
        customResponse<{ user: IUser }>({
          success: true,
          error: false,
          message: `User has been followed successfully`,
          status: 200,
          data: { user: updatedUser },
        })
      );
    }

    return next(createHttpError(403, `You already follow this user`));
  } catch (error) {
    return next(InternalServerError);
  }
};

export const unFollowUserService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    if (req.user?._id.equals(req.params.userId)) {
      return next(createHttpError(403, `You cant un follow yourself`));
    }

    const toBeFollowedUser = await User.findById(req.params.userId);
    if (!toBeFollowedUser) {
      return next(new createHttpError.BadRequest());
    }

    const currentUser = await User.findById(req.user?._id);

    const isAlreadyFollowed = toBeFollowedUser.followers.some(function (user: FollowT) {
      if (user.userId?.toString() === currentUser._id.toString()) return true;
      return false;
    });

    if (isAlreadyFollowed) {
      await toBeFollowedUser.updateOne(
        { $pull: { followers: { userId: currentUser?._id } } },
        {
          new: true,
        }
      );
      await currentUser.updateOne({ $pull: { followings: { userId: req.params.userId } } });

      const updatedUser = await User.findById(req.user?._id)
        .select('-password -confirmPassword -cloudinary_id -status -isDeleted -acceptTerms -isVerified')
        .populate('cart.items.productId')
        .exec();

      return res.status(200).send(
        customResponse<{ user: IUser }>({
          success: true,
          error: false,
          message: `User has been un followed successfully`,
          status: 200,
          data: { user: updatedUser },
        })
      );
    }

    return next(createHttpError(403, `You haven't follow this user before`));
  } catch (error) {
    return next(InternalServerError);
  }
};
