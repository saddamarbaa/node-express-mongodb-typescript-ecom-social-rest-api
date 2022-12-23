import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import validator from '../validator';
import { userSchema } from './userSchema';

export const signupUserValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.signupUser, req.body, next);

export const loginUserValidation: RequestHandler = (req, res, next) => validator(userSchema.loginUser, req.body, next);

export const updateUserValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.updateUser, req.body, next);

export const verifyUserMailValidation: RequestHandler = (req, res, next) => {
  console.log(mongoose.Types.ObjectId.isValid(req.params.userId));
  return validator(userSchema.verifyUserMail, req.params, next);
};

export const refreshTokenValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.refreshToken, req.body, next);

export const sendVerificationMailValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.sendVerificationMail, req.body, next);

export const resetPasswordValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.resetPassword, { ...req.body, ...req.params }, next);
