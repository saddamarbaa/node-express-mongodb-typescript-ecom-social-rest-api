const express = require('express');

const authController = require('../controllers/auth.controller');
const authValidation = require('../middlewares/validate-request-schema/auth.validation');
const { isAuth, isAuthWithAccessToken } = require('../middlewares/auth/checkIsAuth');

const router = express.Router();

/**
 * @api {post}  /api/v1/auth/signup
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

router.post('/signup', authValidation.signupValidation(), authController.signUpController);

/**
 * @api {post}  /api/v1/auth/login
 * @apiName login user
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String} [email] Email
 * @apiParam  {String} password]  Password
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.post('/login', authValidation.loginValidation(), authController.loginController);

/**
 * @api {post}  /api/v1/auth/logout
 * @apiName Logout the user
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String}  [refreshToken]   refreshToken
 *
 * @apiSuccess (200) {Object}
 */

router.post('/logout', isAuth, authController.logoutController);

/**
 * @api {get}  /api/v1/auth//me
 * @apiName Get user data
 * @apiPermission Protected
 * @apiGroup User
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.get('/me', isAuth, authController.userProfileController);

/**
 * @api {post}  /api/v1/auth/forget-password
 * @apiName Rest Password
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String} [email] Email
 *
 * @apiSuccess (200) {Object} mixed `Response` object
 */

router.post('/forget-password', authValidation.forgetPasswordValidation(), authController.forgetPasswordController);

/**
 * @api {post}  /api/v1/auth/reset-password/:userId/:token
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
  authValidation.verifyValidation(),
  authController.resetPasswordController
);

/**
 * @api {get}  /api/v1/auth/verify-email/:userId/:token
 * @apiName verfiy email
 * @apiPermission Public
 * @apiGroup User
 *
 *
 * @apiSuccess (200) {Object} mixed  object
 */

router.get('/verify-email/:userId/:token', authValidation.verifyValidation(), authController.verifyEmailController);

/**
 * @api {patch}  /api/v1/auth/userId
 * @apiName update user
 * @apiPermission Protected route or admin
 * @apiGroup Protected & admin
 *
 * @apiParam  {String} [userId] userId
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.patch('/:userId', authValidation.validateID, isAuth, authController.updateUserController);

/**
 * @api {delete}  /api/v1/auth/userId
 * @apiName delete user
 * @apiPermission Protected route or admin
 * @apiGroup Protected & admin
 *
 * @apiParam  {String} [userId] userId
 * @apiSuccess (200) {Object} mixed  object
 */

router.delete('/:userId', authValidation.validateID, isAuth, authController.deleteUserController);

/**
 * @api  {post}  /api/v1/auth/refreshToken
 * @apiName  Get new  refreshToken
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String}  [refreshToken]   refreshToken
 *
 * @apiSuccess (200) {Object}   accessToken and refreshToken
 */

router.post('/refreshToken', authController.requestRefreshTokenController);

module.exports = router;
