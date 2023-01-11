import Joi from 'joi';
// @ts-ignore
import JoiObjectId from 'joi-objectid';

const vaildObjectId = JoiObjectId(Joi);

export const userSchema = {
  signupUser: Joi.object({
    name: Joi.string().min(3).max(15).required(),
    surname: Joi.string().min(3).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')),
    companyName: Joi.string(),
    dateOfBirth: Joi.string(),
    mobileNumber: Joi.string(),
    gender: Joi.string(),
    profileImage: Joi.string(),
    role: Joi.string(),
    favoriteAnimal: Joi.string(),
    nationality: Joi.string(),
    isVerified: Joi.boolean(),
    isDeleted: Joi.boolean(),
    status: Joi.string(),
    bio: Joi.string().min(10).max(300),
    jobTitle: Joi.string().min(2).max(300),
    address: Joi.string(),
    acceptTerms: Joi.boolean(),
    confirmationCode: Joi.string(),
  }),
  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  updateUser: Joi.object({
    name: Joi.string().min(3).max(15),
    email: Joi.string().email(),
    firstName: Joi.string().min(3).max(15),
    lastName: Joi.string().min(3).max(15),
    familyName: Joi.string().min(3).max(15),
    companyName: Joi.string(),
    dateOfBirth: Joi.string(),
    mobileNumber: Joi.string(),
    gender: Joi.string(),
    profileImage: Joi.string(),
    role: Joi.string(),
    favoriteAnimal: Joi.string(),
    nationality: Joi.string(),
    isVerified: Joi.boolean(),
    isDeleted: Joi.boolean(),
    status: Joi.string(),
    bio: Joi.string().min(10).max(300),
    jobTitle: Joi.string().min(2).max(300),
    address: Joi.string(),
    acceptTerms: Joi.boolean(),
    confirmationCode: Joi.string(),
  }),
  verifyUserMail: Joi.object({
    token: Joi.string().min(3).max(300).required(),
    userId: vaildObjectId().required(),
  }),
  refreshToken: Joi.object({
    refreshToken: Joi.string().min(3).max(300).required(),
  }),
  sendVerificationMail: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    token: Joi.string().min(3).max(300).required(),
    userId: vaildObjectId().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')),
  }),
  validatedUserId: Joi.object({
    userId: vaildObjectId().required(),
  }),
};

export default userSchema;
