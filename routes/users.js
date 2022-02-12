const express = require('express');

const userController = require('../controllers/users.controller');
const userValidation = require('../middlewares/validate-request-schema/user.validation');
const authenticateToken = require('../middlewares/auth/check-auth');

const router = express.Router();

/**
 * @api {post}  /api/v1/users/login
 * @apiName login user
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String} [email] Email
 * {String} password]  Password
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

router.patch('/:userId', userValidation.userIdValidation(), authenticateToken, userController.user_update);

/**
 * @api {delete}  /api/v1/users/userId
 * @apiName delete user
 * @apiPermission Protected route or admin
 * @apiGroup Protected & admin
 *
 * @apiParam  {String} [userId] userId
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.delete('/:userId', userValidation.userIdValidation(), userController.user_delete);

module.exports = router;
