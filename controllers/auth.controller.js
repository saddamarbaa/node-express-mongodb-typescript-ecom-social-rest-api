const authServices = require('../services/auth.service');

exports.signUpController = async (req, res, next) => {
  const signupService = await authServices.signup(req, res, next);
  return res.status(signupService.status).send(signupService);
};

exports.loginController = async (req, res, next) => {
  try {
    const loginService = await authServices.login(req, res, next);
    return res.status(loginService.status).send(loginService);
  } catch (error) {
    return next(error);
  }
};

exports.logoutController = async (req, res, next) => {
  try {
    const logoutService = await authServices.logout(req, res, next);
    return res.status(logoutService.status).send(logoutService);
  } catch (error) {
    return next(error);
  }
};

exports.verifyEmailController = async (req, res, next) => {
  try {
    const verifyEmailService = await authServices.verifyEmail(req, res, next);
    return res.status(verifyEmailService.status).send(verifyEmailService);
  } catch (error) {
    return next(error);
  }
};

exports.userProfileController = async (req, res, next) => {
  try {
    const userProfileService = await authServices.getMe(req, res, next);
    return res.status(userProfileService.status).send(userProfileService);
  } catch (error) {
    return next(error);
  }
};

exports.forgetPasswordController = async (req, res, next) => {
  try {
    const forgetPasswordService = await authServices.requestPasswordReset(req, res, next);
    return res.status(forgetPasswordService.status).send(forgetPasswordService);
  } catch (error) {
    return next(error);
  }
};

exports.resetPasswordController = async (req, res, next) => {
  const resetPasswordService = await authServices.resetPassword(req, res, next);
  return res.status(resetPasswordService.status).send(resetPasswordService);
};

exports.updateUserController = async (req, res, next) => {
  try {
    const updateUserService = await authServices.updateUser(req, res, next);
    return res.status(updateUserService.status).send(updateUserService);
  } catch (error) {
    return next(error);
  }
};

exports.deleteUserController = async (req, res, next) => {
  try {
    const deleteUserService = await authServices.deleteUser(req, res, next);
    return res.status(deleteUserService.status).send(deleteUserService);
  } catch (error) {
    return next(error);
  }
};

exports.requestRefreshTokenController = async (req, res, next) => {
  try {
    const refreshTokenService = await authServices.requestRefreshToken(req, res, next);
    return res.status(refreshTokenService.status).send(refreshTokenService);
  } catch (error) {
    return next(error);
  }
};






