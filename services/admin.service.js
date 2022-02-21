const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const User = require('../models/users.model');
const Token = require('../models/token.model');

const Response = require('../utils/response');
const { WEBSITE_URL, API_VERSION, CLIENT_URL } = require('../configs/environment.config');

exports.getUsers = (req, res) => {
  const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;

  const responseObject = {
    totalDocs: totalDocs || 0,
    totalPages: totalPages || 0,
    lastPage: lastPage || 0,
    count: results?.length || 0,
    currentPage: currentPage || 0
  };

  if (next) {
    responseObject.nextPage = next;
  }
  if (previous) {
    responseObject.prevPage = previous;
  }

  responseObject.users = results.map(user => {
    return {
      _id: user._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      dateOfBirth: user?.dateOfBirth,
      gender: user?.gender,
      cart: user?.cart,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
      role: user?.role,
      isVerified: user?.isVerified,
      status: user?.status
    };
  });

  return Response(responseObject, true, false, 'Successful Found users', 200);
};

/**
 * @desc      Get user
 * @route    GET /api/v1/auth/userId or/api/v1/admin/users/userId
 * @access   Private
 */

exports.getUser = async (req, res, next) => {
  let responseObject = {};
  const userId = req.params.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      userId: userId
    };

    responseObject.validationErrors = errors.array();

    return responseObject;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return Response([], false, true, `Failed to delete user by given ID ${userId}`, 400);
    }

    const data = {
      user: {
        _id: user._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        dateOfBirth: user?.dateOfBirth,
        gender: user?.gender,
        cart: user?.cart,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
        role: user?.role,
        request: {
          type: 'Get',
          description: 'Get all the user',
          url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/admin/users`
        }
      }
    };

    return Response(data, true, false, `Successfully find user by ID: ${userId}`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     Update user
 * @route    PATCH /api/v1/auth/userId or/api/v1/admin/users/userId
 * @access   Private
 */

exports.updateUser = async (req, res, next) => {
  let responseObject = {};

  const { firstName, lastName, email, password, dateOfBirth, gender, cart, confirmPassword } = req.body;
  const userId = req.params.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      userId: userId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return Response([], false, true, `Database Update Failure`, 400);
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password || user.password;
    user.confirmPassword = confirmPassword || user.confirmPassword;
    user.gender = gender || user.gender;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.cart = cart || user.cart;

    const updatedUser = await user.save();
    const data = {
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        cart: updatedUser.cart,
        createdAt: updatedUser?.createdAt,
        updatedAt: updatedUser?.updatedAt,
        role: updatedUser?.role
      },
      request: {
        type: 'Get',
        description: 'Get all the user',
        url: `${process.env.WEBSITE_URL}/api/${process.env.API_VERSION}/admin/users`
      }
    };

    return Response(data, true, false, `Successfully updated user by ID: ${userId}`, 201);
  } catch (error) {
    if (error?.code === 11000) {
      // also we can send  422(422 Unprocessable Entity)
      // 409 Conflict
      return Response({}, false, true, `E-Mail address  ${email} is already exists, please pick a different one.`, 409);
    }

    // 500 Internal Server Error
    return next(error);
  }
};

/**
 * @desc     Delete user
 * @route    DELETE /api/v1/admin/users/userId
 * @access   Private
 */

exports.deleteUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    const responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      userId: req.params.userId
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const toBeDeletedUser = await User.findByIdAndRemove({
      _id: req.params.userId
    });

    if (!toBeDeletedUser) {
      return Response([], false, true, `Failed to delete user by given ID ${req.params.userId}`, 400);
    }

    return Response([], true, false, `Successfully deleted user by ID ${req.params.userId}`, 200);
  } catch (error) {
    return next(error);
  }
};
