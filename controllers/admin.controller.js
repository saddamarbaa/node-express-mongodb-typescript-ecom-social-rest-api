const adminServices = require('../services/admin.service');
const authServices = require('../services/auth.service');

// Admin Users

exports.getUsersController = async (req, res, next) => {
  try {
    const getUsersService = await adminServices.getUsers(req, res, next);
    return res.status(getUsersService.status).send(getUsersService);
  } catch (error) {
    return next(error);
  }
};

exports.addUserController = async (req, res, next) => {
  const signupService = await authServices.signup(req, res, next);
  return res.status(signupService.status).send(signupService);
};

exports.getUserController = async (req, res, next) => {
  try {
    const userService = await adminServices.getUser(req, res, next);
    return res.status(userService.status).send(userService);
  } catch (error) {
    return next(error);
  }
};

exports.updateUserController = async (req, res, next) => {
  try {
    const updateUserService = await adminServices.updateUser(req, res, next);
    return res.status(updateUserService.status).send(updateUserService);
  } catch (error) {
    return next(error);
  }
};

exports.deleteUserController = async (req, res, next) => {
  try {
    const deleteUserService = await adminServices.deleteUser(req, res, next);
    return res.status(deleteUserService.status).send(deleteUserService);
  } catch (error) {
    return next(error);
  }
};

// Admin Products

exports.addProductController = async (req, res, next) => {
  try {
    const addProductService = await adminServices.addProduct(req, res, next);
    return res.status(addProductService.status).send(addProductService);
  } catch (error) {
    return next(error);
  }
};

exports.deleteProductController = async (req, res, next) => {
  try {
    const deleteProductService = await adminServices.deleteProduct(req, res, next);
    return res.status(deleteProductService.status).send(deleteProductService);
  } catch (error) {
    return next(error);
  }
};
