const authService = require('../services/auth.service');

exports.signUpController = async (req, res, next) => {
  const signupService = await authService.signup(req, res, next);
  return res.status(signupService.status).send(signupService);
};

exports.loginController = async (req, res, next) => {
  try {
    const loginService = await authService.login(req, res, next);
    return res.status(loginService.status).send(loginService);
  } catch (error) {
    return next(error);
  }
};

exports.logoutController = async (req, res, next) => {
  try {
    const logoutService = await authService.logout(req, res, next);
    return res.status(logoutService.status).send(logoutService);
  } catch (error) {
    return next(error);
  }
};

exports.userProfileController = async (req, res, next) => {
  try {
    const userProfileService = await authService.getMe(req, res, next);
    return res.status(userProfileService.status).send(userProfileService);
  } catch (error) {
    return next(error);
  }
};

exports.forgetPasswordController = async (req, res, next) => {
  try {
    const forgetPasswordService = await authService.requestPasswordReset(req, res, next);
    return res.status(forgetPasswordService.status).send(forgetPasswordService);
  } catch (error) {
    return next(error);
  }
};

exports.resetPasswordController = async (req, res, next) => {
  const resetPasswordService = await authService.resetPassword(req, res, next);
  return res.status(resetPasswordService.status).send(resetPasswordService);
};
