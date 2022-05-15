const express = require('express');

const UserModel = require('../models/users.model');
const adminController = require('../controllers/admin.controller');

const { isAuth } = require('../middlewares/auth/checkIsAuth');
const isAdmin = require('../middlewares/auth/checkIsAdmin');
const paginationMiddleware = require('../middlewares/sort-filter-pagination/usersFeatures.middleware');
const adminValidation = require('../middlewares/validate-request-schema/auth.validation');

const productValidation = require('../middlewares/validate-request-schema/product.validation');
const { uploadImage } = require('../middlewares/file-upload/uploadImage.middleware');

const router = express.Router();

/**
 * @api {get}  /api/v1/admin/users
 * @apiName Get users
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiSuccess (200) {Object} mixed `Users` object
 */

router.get('/users', isAuth, isAdmin, paginationMiddleware(UserModel), adminController.getUsersController);

/**
 * @api {post}  /api/v1/admin/users
 * @apiName Create new user
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiParam  {String} [firstName] FirstName
 * @apiParam  {String} [lastName]  LastName
 * @apiParam  {String} [email] Email
 * @apiParam  {String} [password]  Password
 * @apiParam  {String} [confirmPassword] ConfirmPassword
 * @apiParam  {String} [ dateOfBirth]  DateOfBirth
 * @apiParam  {String} [  role]   role
 * @apiParam  {String} [gender] Gender
 *
 * @apiSuccess (201) {Object} mixed `User` object
 */

router.post(
  '/users',
  uploadImage.single('productImage'),
  isAuth,
  isAdmin,
  adminValidation.signupValidation(),
  adminController.addUserController
);

/**
 * @api {get}  /api/v1/admin/users/userId
 * @apiName Get user
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

router.get('/users/:userId', isAuth, isAdmin, adminValidation.validateID, adminController.getUserController);

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
  uploadImage.single('productImage'),
  isAuth,
  isAdmin,
  adminValidation.validateID,
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

router.delete('/users/:userId', isAuth, isAdmin, adminValidation.validateID, adminController.deleteUserController);

/**
 * @api {post} /api/v1/admin/products
 * @apiName add new product
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiParam  {String} [name]  Name
 * @apiParam  {number} [price] Price
 * @apiParam  {String} [description] Description
 * @apiParam  {String} [postImage]  Image
 *
 * @apiSuccess (201) {Object} mixed `Product` object
 */

router.post(
  '/products',
  uploadImage.single('productImage'),
  isAuth,
  isAdmin,
  productValidation,
  adminController.addProductController
);

/**
 * @api {delete}  /api/v1/admin/products/productId
 * @apiName Delete product
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiParam  {String} [productId] productId
 * @apiSuccess (200) {Object} mixed `product` object
 */

router.delete(
  '/products/:productId',
  isAuth,
  isAdmin,
  adminValidation.validateID,
  adminController.deleteProductController
);

/**
 * @api {patch}  /api/v1/admin/products/productId
 * @apiName Update product
 * @apiPermission Protected(only admin)
 * @apiGroup Admin
 *
 * @apiParam  {String} [productId] productId
 * @apiSuccess (200) {Object} mixed `product` object
 */

router.patch(
  '/products/:productId',
  uploadImage.single('productImage'),
  isAuth,
  isAdmin,
  adminValidation.validateID,
  adminController.updateProductController
);

module.exports = router;
