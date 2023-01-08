import express from 'express';
import { environmentConfig } from '@src/configs';
import { managerGetOrdersController, managerGetPostsController, managerGetUsersController } from '@src/controllers';
import { customRoles, isAuth, postPaginationMiddleware } from '@src/middlewares';

const router = express.Router();

router.get('/users', isAuth, customRoles(environmentConfig.MANGER_EMAILS), managerGetUsersController);
router.get('/orders', isAuth, customRoles(environmentConfig.MANGER_EMAILS), managerGetOrdersController);
router.get(
  '/feed/posts',
  isAuth,
  customRoles(environmentConfig.MANGER_EMAILS),
  postPaginationMiddleware(),
  managerGetPostsController
);
export = router;
