const express = require('express');

const userController = require('../controllers/users.controller');
const userValidation = require('../middlewares/validate-request-schema/user.validation');
const { isAuth, isAuthWithAccessToken } = require('../middlewares/auth/checkIsAuth');

const { check } = require('express-validator');

const router = express.Router();

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let error = {};
    errors.array().map(err => (error[err.param] = err.msg));
    return res.status(422).json({ error });
  }

  next();
};

/**
 * @api {post}  /api/v1/users/login
 * @apiName login user
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String} [email] Email
 * @apiParam  {String} password]  Password
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.post('/login', userValidation.loginValidation(), userController.user_login);

/**
 * @api {post}  /api/v1/users/signup
 * @apiName Create new user
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String} [firstName] FirstName
 * @apiParam  {String} [lastName]  LastName
 * @apiParam  {String} [email] Email
 * @apiParam  {String} password]  Password
 * @apiParam  {String} [confirmPassword] ConfirmPassword
 * @apiParam  {String} [ dateOfBirth]  DateOfBirth
 * @apiParam  {String} [gender] Gender
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.post('/signup', userValidation.signupValidation(), userController.user_signup);

/**
 * @api {patch}  /api/v1/users/userId
 * @apiName update user
 * @apiPermission Protected route or admin
 * @apiGroup Protected & admin
 *
 * @apiParam  {String} [userId] userId
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.patch('/:userId', userValidation.userIdValidation(), isAuth, userController.user_update);

/**
 * @api {delete}  /api/v1/users/userId
 * @apiName delete user
 * @apiPermission Protected route or admin
 * @apiGroup Protected & admin
 *
 * @apiParam  {String} [userId] userId
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.delete('/:userId', userValidation.userIdValidation(), isAuth, userController.user_delete);

/**
 * @api {get}  /api/v1/users//me
 * @apiName Get user data
 * @apiPermission Protected
 * @apiGroup User
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.get('/me', isAuth, userController.user_get_me);

/**
 * @api {post}  /api/v1/users/forget-password
 * @apiName Rest Password
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String} [email] Email
 *
 * @apiSuccess (200) {Object} mixed `Response` object
 */

router.post('/forget-password', userValidation.forgetPasswordValidation(), userController.user_request_password_reset);

/**
 * @api {post}  /api/v1/users/reset-password/:token
 * @apiName Update Password
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String} password]  Password
 * @apiParam  {String} [confirmPassword] ConfirmPassword
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.post(
  '/reset-password/:userId/:token',
  userValidation.forgetPasswordValidation(),
  userController.user_reset_password
);

/**
 * @api {post}  /api/v1/users/refreshToken
 * @apiName Get new  refreshToken
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String}  [refreshToken]   refreshToken
 *
 * @apiSuccess (200) {Object}   accessToken and refreshToken
 */

router.post('/refreshToken', userController.user_request_refreshToken);
module.exports = router;

/**
 * @api {post}  /api/v1/users/logout
 * @apiName Logout the user
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String}  [refreshToken]   refreshToken
 *
 * @apiSuccess (200) {Object}
 */

router.post('/logout', isAuth, userController.user_logout);
module.exports = router;
