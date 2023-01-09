import express from 'express';

import {
  addPostValidation,
  addProductValidation,
  customRoles,
  isAdmin,
  isAuth,
  postIdValidation,
  postPaginationMiddleware,
  productsPaginationMiddleware,
  signupUserValidation,
  updateOrderStatusValidation,
  updateProductValidation,
  updateUserValidation,
  uploadImage,
  usersPaginationMiddleware,
} from '@src/middlewares';
import {
  adminAddProductController,
  adminAddUserController,
  adminClearAllOrdersController,
  adminCreatePostController,
  adminDeletePostController,
  adminDeleteProductController,
  adminDeleteSingleOrderController,
  adminGetAllOrdersForGivenUserController,
  adminGetOrderController,
  adminGetOrdersController,
  adminGetPostController,
  adminGetPostsController,
  adminGetProductController,
  adminGetProductsController,
  adminGetUserController,
  adminGetUsersController,
  adminRemoveUserController,
  adminUpdateAuthController,
  adminUpdateOrderStatusController,
  adminUpdateProductController,
} from '@src/controllers';
import { environmentConfig } from '@src/configs';
import { adminClearAllPostsService, adminDeleteAllOrderForGivenUserService } from '@src/services';

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
router.delete(
  '/orders/clear-all-orders',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS),
  adminClearAllOrdersController
);
router.get(
  '/orders/get-user-order/:userId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS),
  adminGetAllOrdersForGivenUserController
);
router
  .route('/orders/:orderId')
  .get(isAuth, customRoles(environmentConfig.ADMIN_EMAILS), adminGetOrderController)
  .patch(
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS),
    updateOrderStatusValidation,
    adminUpdateOrderStatusController
  )
  .delete(isAuth, customRoles(environmentConfig.ADMIN_EMAILS), adminDeleteSingleOrderController);

router.delete(
  '/orders/clear-user-order/:userId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS),
  adminDeleteAllOrderForGivenUserService
);

router
  .route('/feed/posts')
  .get(isAuth, customRoles(environmentConfig.ADMIN_EMAILS), postPaginationMiddleware(), adminGetPostsController)
  .post(
    uploadImage.single('postImage'),
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS),
    addPostValidation,
    adminCreatePostController
  );

router.delete(
  '/feed/posts/clear-all-posts',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS),
  adminClearAllPostsService
);

router
  .route('/feed/posts/:postId')
  .get(isAuth, customRoles(environmentConfig.ADMIN_EMAILS), postIdValidation, adminGetPostController)
  .delete(isAuth, customRoles(environmentConfig.ADMIN_EMAILS), postIdValidation, adminDeletePostController);

export = router;
