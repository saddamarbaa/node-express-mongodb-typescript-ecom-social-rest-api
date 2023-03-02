import { NextFunction, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';

import User from '@src/models/User.model';

import { AuthenticatedRequestBody, IUser } from '@src/interfaces';
import { customResponse } from '@src/utils';

export const followUserService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    if (req.user?._id.equals(req.params.userId)) {
      return next(createHttpError(403, `You cannot follow yourself`));
    }

    const toBeFollowedUser = await User.findById(req.params.userId).populate('followers');

    if (!toBeFollowedUser) {
      return next(createHttpError(400, `User not found`));
    }

    const currentUser = await User.findById(req.user?._id).populate('following');

    const isAlreadyFollowed = toBeFollowedUser.followers.some(function (user: { _id: string }) {
      if (user._id.toString() === currentUser._id.toString()) return true;
      return false;
    });

    if (!isAlreadyFollowed) {
      await toBeFollowedUser.updateOne({
        $push: {
          followers: currentUser?._id,
        },
        new: true,
      });

      await currentUser.updateOne({
        $push: {
          following: req.params.userId,
        },
      });

      const updatedUser = await User.findById(req.user?._id)
        .select('-password -confirmPassword -cloudinary_id -status -isDeleted -acceptTerms -isVerified')
        .populate('following', 'name  surname  profileImage bio')
        .populate('followers', 'name  surname  profileImage bio')
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

    return next(createHttpError(403, `You already followed this user`));
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
      return next(createHttpError(400, `User not found`));
    }

    const currentUser = await User.findById(req.user?._id).populate('following');

    const isAlreadyFollowed = toBeFollowedUser.followers.some(function (user: { _id: string }) {
      if (user._id.toString() === currentUser._id.toString()) return true;
      return false;
    });

    if (isAlreadyFollowed) {
      await toBeFollowedUser.updateOne(
        { $pull: { followers: currentUser?._id } },
        {
          new: true,
        }
      );

      await currentUser.updateOne({
        $pull: {
          following: req.params.userId,
        },
      });

      const updatedUser = await User.findById(req.user?._id)
        .select('-password -confirmPassword -cloudinary_id -status -isDeleted -acceptTerms -isVerified')
        .populate('following', 'name  surname  profileImage bio')
        .populate('followers', 'name  surname  profileImage bio')
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

export const whoViewedMyProfileService = async (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    const userWhoViewed = await User.findById(req.user?._id);

    if (!user || !userWhoViewed) {
      throw createHttpError(404, 'User not found');
    }

    const hasUserViewedProfile = user.viewers.some(
      (viewer: string) => viewer.toString() === userWhoViewed._id.toString()
    );

    const isUserViewingOwnProfile = req.user?._id.equals(userId);

    const shouldAddViewer = !hasUserViewedProfile && !isUserViewingOwnProfile;

    if (shouldAddViewer) {
      user.viewers.push(userWhoViewed._id);
    }

    await user.save();

    const updatedUser = await User.findById(userId)
      .select('-password -confirmPassword -cloudinary_id -status -isDeleted -acceptTerms -isVerified')
      .populate('following', 'name  surname  profileImage bio')
      .populate('followers', 'name  surname  profileImage bio')
      .populate('viewers', 'name  surname  profileImage bio')
      .populate('cart.items.productId')
      .exec();

    const message = hasUserViewedProfile
      ? 'You have already viewed this profile'
      : `You have successfully viewed this profile`;
    return res.status(200).send(
      customResponse<{ user: IUser }>({
        success: true,
        error: false,
        message,
        status: 200,
        data: { user: updatedUser },
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const blockUserService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (req.user?._id.equals(userId)) {
      return next(createHttpError(403, `You can't block yourself`));
    }

    const userToBeBlocked: IUser | null = await User.findById(userId);
    const userWhoBlocked: IUser | null = await User.findById(req.user?._id);

    if (!userToBeBlocked || !userWhoBlocked) {
      return next(createHttpError(404, 'User not found'));
    }

    const isUserAlreadyBlocked = userWhoBlocked.blocked.some(
      (userIdInDb: string) => userIdInDb.toString() === userToBeBlocked?._id.toString()
    );

    if (isUserAlreadyBlocked) {
      return next(createHttpError(403, 'You already blocked this user'));
    }

    userWhoBlocked?.blocked?.push(userToBeBlocked._id);

    await userWhoBlocked.save();

    const updatedUser: IUser | null = await User.findById(req.user?._id)
      .select('-password -confirmPassword -cloudinary_id -status -isDeleted -acceptTerms -isVerified')
      .populate('following', 'name  surname  profileImage bio')
      .populate('followers', 'name  surname  profileImage bio')
      .populate('viewers', 'name  surname  profileImage bio')
      .populate('blocked', 'name surname profileImage bio')
      .populate('cart.items.productId')
      .exec();

    return res.status(200).send(
      customResponse<{ user: IUser | null }>({
        success: true,
        error: false,
        message: 'You have successfully blocked this user',
        status: 200,
        data: { user: updatedUser },
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};

export const unBlockUserService = async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const userToBeUnblocked: IUser | null = await User.findById(userId);
    const userWhoUnblocked: IUser | null = await User.findById(req.user?._id);

    if (!userToBeUnblocked || !userWhoUnblocked) {
      return next(createHttpError(404, 'User not found'));
    }

    const isUserAlreadyUnblocked = userWhoUnblocked.blocked.some(
      (userIdInDb: string) => userIdInDb.toString() === userToBeUnblocked._id.toString()
    );

    if (!isUserAlreadyUnblocked) {
      return next(createHttpError(403, 'You have not blocked this user'));
    }

    userWhoUnblocked.blocked = userWhoUnblocked.blocked.filter(
      (userIdInDb: string) => userIdInDb.toString() !== userToBeUnblocked._id.toString()
    );
    await userWhoUnblocked.save();

    const updatedUser: IUser | null = await User.findById(req.user?._id)
      .select('-password -confirmPassword -cloudinary_id -status -isDeleted -acceptTerms -isVerified')
      .populate('following', 'name surname profileImage bio')
      .populate('followers', 'name surname profileImage bio')
      .populate('viewers', 'name surname profileImage bio')
      .populate('blocked', 'name surname profileImage bio')
      .populate('cart.items.productId')
      .exec();

    return res.status(200).send(
      customResponse<{ user: IUser | null }>({
        success: true,
        error: false,
        message: 'You have successfully unblocked this user',
        status: 200,
        data: { user: updatedUser },
      })
    );
  } catch (error) {
    return next(InternalServerError);
  }
};
