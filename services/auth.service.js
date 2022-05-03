const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const User = require('../models/users.model');
const Token = require('../models/token.model');

const emailTemplate = require('../utils/sendEmail');
const Response = require('../utils/response');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwtHelper');
const { WEBSITE_URL, API_VERSION, CLIENT_URL } = require('../configs/environment.config');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */

exports.signup = async (req, res, next) => {
  const { firstName, lastName, email, password, dateOfBirth, gender, cart, confirmPassword, role } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    const responseObject = Response({}, false, true, message, 422);
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
    return responseObject;
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
    let token = await new Token({ userId: user._id });

    // Generate and set verify email token
    token.generateEmailVerificationToken();

    // Save the updated token object
    token = await token.save();

    const link = `${CLIENT_URL}/verify-email/token=${token.emailVerificationToken}&id=${token.userId}`;

    // send mail for email verification
    emailTemplate.sendEmailVerificationEmail(email, firstName, link);

    // Send back refreshToken and accessToken
    // const token = user.createJWT();
    // const accessToken = await signAccessToken(user._id);
    // const refreshToken = await signRefreshToken(user._id);

    // Response data
    const data = {
      user: {
        emailVerificationLinkToken: link
        // token: token,
        // accessToken: accessToken,
        // refreshToken: refreshToken
      }
    };

    const message = `Registered Successfully An Email with Verification link has been sent to your account ${email} please verify`;
    return Response(data, true, false, message, 201);
  } catch (error) {
    if (error?.code === 11000) {
      // also we can send  422(422 Unprocessable Entity)
      // 409 Conflict
      return Response(
        {},
        false,
        true,
        `E-Mail address  ${newUser.email} is already exists, please pick a different one.`,
        409
      );
    }

    // 500 Internal Server Error
    return next(error);
  }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    const responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      email: email,
      password: password
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const user = await User.findOne({ email: email });

    // 401 Unauthorized
    if (!user) {
      return Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401);
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return Response({}, false, true, 'Auth Failed (Invalid Credentials)', 401);
    }

    // check user is verified or not
    if (!user.isVerified || user.status !== 'active') {
      // Again send verification email
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({ userId: user._id });

        // Generate and set verify email token
        token.generateEmailVerificationToken();

        // Save the updated token object
        token = await token.save();
      }

      const link = `${CLIENT_URL}/verify-email/token=${token.emailVerificationToken}&id=${token.userId}`;

      // send mail for email verification
      emailTemplate.sendEmailVerificationEmail(email, user.firstName, link);

      const data = {
        emailVerificationLinkToken: link
      };

      return Response(
        data,
        false,
        true,
        `Your Email has not been verified. An Email with Verification link has been sent to your account ${user.email} Please Verify Your Email first`,
        401
      );
    }

    // Send back only the user, refreshToken and accessToken (dont send the password)
    const token = user.createJWT();
    const accessToken = await signAccessToken(user._id);
    const refreshToken = await signRefreshToken(user._id);

    // Response data
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
        isVerified: user?.isVerified,
        token: token,
        accessToken: accessToken,
        refreshToken: refreshToken,
        mobileNumber: user?.mobileNumber,
        isDeleted: user?.isDeleted,
        status: user?.status,
        isVerified: user?.isVerified,
        role: user?.role,
        bio: user?.bio,
        acceptTerms: user?.acceptTerms,
        companyName: user?.companyName,
        nationality: user?.nationality,
        address: user?.address,
        favoriteAnimal: user?.favoriteAnimal,
        profileImage: user?.profileImage
      }
    };

    // send jwt token as kookie
    res.cookie('authToken', token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000, // one year
      secure: process.env.NODE_ENV === 'production'
    });

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // one days
      secure: process.env.NODE_ENV === 'production'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production'
    });

    return Response(data, true, false, 'Auth logged in successful.', 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Verify user account
 * @route   POST /api/v1/auth/login
 * @access  Public
 */

exports.verifyEmail = async (req, res, next) => {
  let responseObject = {};
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      userId: req.params?.userId,
      token: req.params?.token
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return Response(
        {},
        false,
        true,
        `Email verification token is invalid or has expired. Please click on resend for verify your Email.`,
        400
      );

    // user is already verified
    if (user.isVerified && user.status === 'active') {
      return Response({}, false, true, ` User has been already verified. Please Login.`, 200);
    }

    const emailVerificationToken = await Token.findOne({
      userId: user._id,
      emailVerificationToken: req.params.token
    });

    if (!emailVerificationToken)
      return Response({}, false, true, `Email verification token is invalid or has expired.`, 400);

    // Verfiy the user
    user.isVerified = true;
    user.status = 'active';
    await user.save();
    await emailVerificationToken.delete();

    return Response({}, true, false, `Your account has been successfully verified . Please Login. `, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get user data
 * @route   GET /api/v1/auth/me
 * @access  Private
 */

exports.getMe = async (req, res, next) => {
  const data = {
    user: req.user
  };

  return Response(data, true, false, 'Successfully found user profile', 200);
};

/**
 * @desc Recover Password - Generates token and Sends password reset email
 * @route   POST /api/v1/users/forget-password
 * @access  Public
 */

exports.requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    const responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      email: req.body.email
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const message = `The email address ${email} is not associated with any account. Double-check your email address and try again.`;

      return Response({}, false, true, message, 401);
    }

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({ userId: user._id });

      // Generate and set password reset token
      token.generatePasswordReset();

      // Save the updated token object
      token = await token.save();
    }

    const link = `${CLIENT_URL}/reset-password/token=${token.resetPasswordToken}&id=${token.userId}`;

    // send mail
    emailTemplate.sendResetPasswordEmail(email, user.firstName, link);

    return Response(token.resetPasswordToken, true, false, `A reset email has been sent to ${email}.`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc  Reset Password - Validate password reset token
 * @route   POST /api/v1/auth/verify-email/:userId/:token
 * @access  Public
 */

exports.resetPassword = async (req, res, next) => {
  const { email } = req.body;
  let responseObject = {};
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg,
      responseObject = Response({}, false, true, message, 422);
    responseObject.oldInput = {
      email: req.body.email
    };

    responseObject.validationErrors = errors.array();
    return responseObject;
  }

  try {
    const user = await User.findById(req.params.userId);
    if (!user) return Response({}, false, true, `Password reset token is invalid or has expired.`, 400);

    const passwordResetToken = await Token.findOne({
      userId: user._id,
      resetPasswordToken: req.params.token
    });

    if (!passwordResetToken) return Response({}, false, true, `Password reset token is invalid or has expired.`, 400);

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    await passwordResetToken.delete();

    const link = `${CLIENT_URL}/login`;
    // send confirm mail
    emailTemplate.sendConfirmResetPasswordEmail(user.email, user.firstName, link);

    return Response({}, true, false, `Your password has been Password Reset Successfully updated.`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc  Logout the user - Validate refreshToken and clear refreshToken and accessToken and all auth cookies
 * @route   POST /api/v1/auth/refreshToken
 * @access   Private
 */

exports.logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return Response({}, false, true, `Bad Request Please provide a valid  refreshToken.`, 422);

  try {
    // verify the Token
    const userId = await verifyRefreshToken(refreshToken);

    // verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return Response([], false, true, `Unauthenticated`, 400);
    }
    s;
    // clear tokens
    // TODO JWT LOGOUT
    // const token = user.createJWT();
    // const accessToken = await signAccessToken(userId);
    // const refreshTokenRf = await signRefreshToken(userId);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return Response([], false, true, `Successfully logged out 😏 🍀`, 200);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc     Update user
 * @route    PATCH /api/v1/auth/userId
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
 * @route    DELETE /api/v1/auth/userId
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

/**
 * @desc  Get new refreshToken - Validate refreshToken and send new refreshToken and accessToken
 * @route   POST /api/v1/users/refreshToken
 * @access  Public
 */

exports.requestRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return Response({}, false, true, `Bad Request Please provide a valid  refreshToken.`, 422);

    // verify the Token
    const userId = await verifyRefreshToken(refreshToken);

    // verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send(Response([], false, true, `Unauthenticated`, 400));
    }

    // Generate new access and refresh token
    const token = user.createJWT();
    const accessToken = await signAccessToken(userId);
    const refreshTokenRf = await signRefreshToken(userId);

    const data = {
      token: token,
      accessToken: accessToken,
      refreshToken: refreshTokenRf
    };

    responseObject = Response(data, true, false, 'Success', 201);
    return responseObject;
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    generate random uses
 * @route   POST /api/v1/auth/userId
 * @access  Private
 */

exports.generateRandomUser = async (req, res) => {
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
      console.log('error');
    }
  }
};

// TODO
// https://github.com/fsbahman/apidoc-swagger
// https://swagger.io/
// https://apiblueprint.org/
