const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const User = require('../models/users.model');
const sendEmail = require('../utils/sendEmail');
const Response = require('../utils/response');
const { WEBSITE_URL, API_VERSION } = require('../configs/environment.config');

/**
 * @desc    Register new user
 * @route   POST /api/v1/users/signup
 * @access  Public
 */

exports.user_signup = async (req, res, next) => {
  let responseObject = {};
  const { firstName, lastName, email, password, dateOfBirth, gender, cart, confirmPassword, role } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      dateOfBirth,
      gender
    };

    responseObject.validationErrors = errors.array();

    return res.status(422).send(responseObject);
  }

  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    dateOfBirth,
    gender,
    cart,
    role
  });

  try {
    const user = await newUser.save();

    // send back only the user and token (not password been send)
    const token = user.createJWT();

    const data = {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        cart: user.cart,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
        role: user?.role,
        token: token
      }
    };

    responseObject = Response(data, true, false, 'Registered Successfully', 201);
    return res.status(200).send(responseObject);

    // send mail
    // sendEmail(user?.email);
  } catch (error) {
    if (error?.code === 11000) {
      // also we can send  422(422 Unprocessable Entity)
      // 409 Conflict
      return res
        .status(409)
        .send(
          Response(
            {},
            false,
            true,
            `E-Mail address  ${newUser.email} is already exists, please pick a different one.`,
            409
          )
        );
    }

    // 500 Internal Server Error
    return next(error);
  }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/v1/users/login
 * @access  Public
 */

exports.user_login = async (req, res, next) => {
  let responseObject = {};
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      email: email,
      password: password
    };

    responseObject.validationErrors = errors.array();

    return res.status(422).send(responseObject);
  }

  try {
    const user = await User.findOne({ email: email });

    // 401 Unauthorized
    if (!user) {
      return res.status(401).send(Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401));
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).send(Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401));
    }

    // Send back only the user and token (dont send the password)
    const token = user.createJWT();

    const data = {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
        role: user?.role,
        token: token
      }
    };

    responseObject = Response(data, true, false, 'Auth successful', 200);
    return res.status(200).send(responseObject);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     Delete user
 * @route    DELETE /api/v1/users/userId or/api/v1/admin/users/userId
 * @access   Private
 */

exports.user_delete = async (req, res, next) => {
  let responseObject = {};
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      userId: req.params.userId
    };

    responseObject.validationErrors = errors.array();
    return res.status(422).send(responseObject);
  }

  try {
    const toBeDeletedUser = await User.findByIdAndRemove({
      _id: req.params.userId
    });

    if (!toBeDeletedUser) {
      return res
        .status(400)
        .send(Response([], false, true, `Failed to delete user by given ID ${req.params.userId}`, 400));
    }

    return res.status(200).send(Response([], true, false, `Successfully deleted user by ID ${req.params.userId}`, 200));
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     Update user
 * @route    PATCH /api/v1/users/userId or/api/v1/admin/users/userId
 * @access   Private
 */

exports.user_update = async (req, res, next) => {
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
    return res.status(422).send(responseObject);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send(Response([], false, true, `Database Update Failure`, 400));
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

    return res.status(201).send(Response(data, true, false, `Successfully updated user by ID: ${userId}`, 201));
  } catch (error) {
    if (error?.code === 11000) {
      // also we can send  422(422 Unprocessable Entity)
      // 409 Conflict
      return res
        .status(409)
        .send(
          Response({}, false, true, `E-Mail address  ${email} is already exists, please pick a different one.`, 409)
        );
    }

    // 500 Internal Server Error
    return next(error);
  }
};

/**
 * @desc      Get user
 * @route    GET /api/v1/users/userId or/api/v1/admin/users/userId
 * @access   Private
 */

exports.user_get_one_user = async (req, res, next) => {
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
    return res.status(422).send(responseObject);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send(Response([], false, true, `Failed to delete user by given ID ${userId}`, 400));
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

    return res.status(200).send(Response(data, true, false, `Successfully find user by ID: ${userId}`, 200));
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get user data
 * @route   GET /api/v1/users/me
 * @access  Private
 */

exports.user_get_me = async (req, res, next) => {
  const data = {
    user: req.user
  };
  return res.status(200).send(Response(data, true, false, `Successfully found user profile`, 200));
};

// Handling Post Request to /api/v1/users/signup
exports.user_signup_Script = async (req, res) => {
  // program to generate random strings

  // declare all characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  for (let i = 0; i < 1000; i++) {
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      firstName: 'test',
      lastName: 'test',
      email: `${generateString(5)}nh@gmail.com`,
      password: '123456',
      confirmPassword: '123456',
      dateOfBirth: '02-12-1994',
      gender: 'male'
    });

    try {
      const user = await newUser.save();
      console.log(i);
    } catch (error) {
      console.log('errrrrrr');
    }
  }
};

// https://github.com/fsbahman/apidoc-swagger
// https://swagger.io/
// https://apiblueprint.org/
