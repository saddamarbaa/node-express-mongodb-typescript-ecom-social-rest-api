import express from 'express';

import {
  addPostValidation,
  addProductValidation,
  customRoles,
  deleteCommentValidation,
  isAdmin,
  isAuth,
  postIdValidation,
  postPaginationMiddleware,
  productIdValidation,
  productsPaginationMiddleware,
  signupUserValidation,
  updateOrderStatusValidation,
  updatePostValidation,
  updateProductValidation,
  updateUserValidation,
  uploadImage,
  userIdValidation,
  usersPaginationMiddleware,
} from '@src/middlewares';
import {
  adminAddProductController,
  adminAddUserController,
  adminClearAllOrdersController,
  adminClearAllProductsController,
  adminCreatePostController,
  adminDeleteAllCommentInPostController,
  adminDeleteAllPostForGivenUserController,
  adminDeleteCommentInPostController,
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
  adminUpdatePostController,
  adminUpdateProductController,
} from '@src/controllers';
import { environmentConfig } from '@src/configs';
import { adminClearAllPostsService, adminDeleteAllOrderForGivenUserService } from '@src/services';
import { authorizationRoles } from '@src/constants';

const router = express.Router();

router.get('/users', isAuth, isAdmin, usersPaginationMiddleware(), adminGetUsersController);
router.get('/users/:userId', isAuth, adminGetUserController);

router.post(
  '/users/add',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  uploadImage.single('profileImage'),
  signupUserValidation,
  adminAddUserController
);

router.put(
  '/users/update/:userId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  uploadImage.single('profileImage'),
  updateUserValidation,
  adminUpdateAuthController
);
router.delete(
  '/users/remove/:userId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  userIdValidation,
  adminRemoveUserController
);

router.post(
  '/products/add',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  uploadImage.array('productImages'),
  addProductValidation,
  adminAddProductController
);

router.put(
  '/products/update/:productId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  uploadImage.array('productImages'),
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  updateProductValidation,
  adminUpdateProductController
);
router.get(
  '/products',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  productsPaginationMiddleware(),
  adminGetProductsController
);
router.get(
  '/products/:productId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  adminGetProductController
);
router.delete(
  '/products/delete/:productId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  productIdValidation,
  adminDeleteProductController
);

router.delete(
  '/products/clear-all-products',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  adminClearAllProductsController
);

router.get(
  '/orders',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  adminGetOrdersController
);
router.delete(
  '/orders/clear-all-orders',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  adminClearAllOrdersController
);
router.get(
  '/orders/get-user-order/:userId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  adminGetAllOrdersForGivenUserController
);
router
  .route('/orders/:orderId')
  .get(isAuth, customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin), adminGetOrderController)
  .patch(
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
    updateOrderStatusValidation,
    adminUpdateOrderStatusController
  )
  .delete(
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
    adminDeleteSingleOrderController
  );

router.delete(
  '/orders/clear-user-order/:userId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  adminDeleteAllOrderForGivenUserService
);

router
  .route('/feed/posts')
  .get(
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
    postPaginationMiddleware(),
    adminGetPostsController
  )
  .post(
    uploadImage.single('postImage'),
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
    addPostValidation,
    adminCreatePostController
  );

router.delete(
  '/feed/posts/clear-all-posts',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  adminClearAllPostsService
);

router.delete(
  '/feed/posts/user/:userId',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  userIdValidation,
  adminDeleteAllPostForGivenUserController
);

router.delete(
  '/feed/posts/comment',
  isAuth,
  customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
  deleteCommentValidation,
  adminDeleteCommentInPostController
);

router
  .route('/feed/posts/comment/:postId')
  .delete(
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
    postIdValidation,
    adminDeleteAllCommentInPostController
  );

router
  .route('/feed/posts/:postId')
  .get(
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
    postIdValidation,
    adminGetPostController
  )
  .delete(
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
    postIdValidation,
    adminDeletePostController
  )
  .patch(
    uploadImage.single('postImage'),
    isAuth,
    customRoles(environmentConfig.ADMIN_EMAILS, authorizationRoles.admin),
    updatePostValidation,
    adminUpdatePostController
  );

export = router;
