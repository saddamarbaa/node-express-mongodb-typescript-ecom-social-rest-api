const express = require('express');

const UserModel = require('../models/users.model');
const adminController = require('../controllers/admin.controller');

const { isAuth } = require('../middlewares/auth/checkIsAuth');
const isAdmin = require('../middlewares/auth/checkIsAdmin');
const paginationMiddleware = require('../middlewares/sort-filter-pagination/features.middleware');
const adminValidation = require('../middlewares/validate-request-schema/auth.validation');

const router = express.Router();

/**
 * @api {get}  /api/admin/users
 * @apiName Get users
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiSuccess (200) {Object} mixed `Users` object
 */

router.get('/users', isAuth, isAdmin, paginationMiddleware(UserModel), adminController.getUsersController);

/**
 * @api {post}  /api/admin/users
 * @apiName Create new user
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiParam  {String} [firstName] FirstName
 * @apiParam  {String} [lastName]  LastName
 * @apiParam  {String} [email] Email
 * @apiParam  {String} password]  Password
 * @apiParam  {String} [confirmPassword] ConfirmPassword
 * @apiParam  {String} [ dateOfBirth]  DateOfBirth
 * @apiParam  {String} [  role]   role
 * @apiParam  {String} [gender] Gender
 *
 * @apiSuccess (201) {Object} mixed `User` object
 */

router.post('/users', isAuth, isAdmin, adminValidation.signupValidation(), adminController.addUserController);

/**
 * @api {get}  /api/v1/admin/users/userId
 * @apiName Get user
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.get('/users/:userId', adminValidation.userIdValidation(), isAuth, isAdmin, adminController.getUserController);

/**
 * @api {patch}   /api/v1/admin/users/userId
 * @apiName Update user
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiParam  {String} [userId] userId
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.patch(
  '/users/:userId',
  adminValidation.userIdValidation(),
  isAuth,
  isAdmin,
  adminController.updateUserController
);

/**
 * @api {delete}  /api/v1/admin/users/userId
 * @apiName Delete user
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiParam  {String} [userId] userId
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.delete(
  '/users/:userId',
  adminValidation.userIdValidation(),
  isAuth,
  isAdmin,
  adminController.deleteUserController
);

module.exports = router;
