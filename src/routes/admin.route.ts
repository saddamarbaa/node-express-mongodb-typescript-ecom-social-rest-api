import express from 'express';

import {
  addProductValidation,
  customRoles,
  isAdmin,
  isAuth,
  productsPaginationMiddleware,
  signupUserValidation,
  updateProductValidation,
  updateUserValidation,
  uploadImage,
  usersPaginationMiddleware,
} from '@src/middlewares';
import {
  adminAddProductController,
  adminAddUserController,
  adminDeleteProductController,
  adminGetOrdersController,
  adminGetProductController,
  adminGetProductsController,
  adminGetUserController,
  adminGetUsersController,
  adminRemoveUserController,
  adminUpdateAuthController,
  adminUpdateProductController,
} from '@src/controllers';
import { environmentConfig } from '@src/configs';

const router = express.Router();

router.get('/users', isAuth, isAdmin, usersPaginationMiddleware(), adminGetUsersController);
router.get('/users/:userId', isAuth, adminGetUserController);

router.post(
  '/users/add',
  isAuth,
  isAdmin,
  uploadImage.single('profileImage'),
  signupUserValidation,
  adminAddUserController
);

router.put(
  '/users/update/:userId',
  isAuth,
  isAdmin,
  uploadImage.single('profileImage'),
  updateUserValidation,
  adminUpdateAuthController
);
router.delete('/users/remove/:userId', isAuth, isAdmin, adminRemoveUserController);

router.post(
  '/products/add',
  uploadImage.single('productImage'),
  isAuth,
  isAdmin,
  addProductValidation,
  adminAddProductController
);
router.put(
  '/products/update/:productId',
  uploadImage.single('productImage'),
  isAuth,
  isAdmin,
  updateProductValidation,
  adminUpdateProductController
);
router.get('/products', isAuth, isAdmin, productsPaginationMiddleware(), adminGetProductsController);
router.get('/products/:productId', isAuth, isAdmin, adminGetProductController);
router.delete('/products/delete/:productId', isAuth, isAdmin, adminDeleteProductController);

router.get('/orders', isAuth, customRoles(environmentConfig.ADMIN_EMAILS), adminGetOrdersController);

export = router;
