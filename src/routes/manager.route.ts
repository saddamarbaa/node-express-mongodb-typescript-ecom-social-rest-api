import express from 'express';

import { environmentConfig } from '@src/configs';
import { managerGetOrdersController, managerGetPostsController, managerGetUsersController } from '@src/controllers';
import { customRoles, isAuth, postPaginationMiddleware } from '@src/middlewares';
import { authorizationRoles } from '@src/constants';

const router = express.Router();

router.get(
  '/users',
  isAuth,
  customRoles(environmentConfig.MANGER_EMAILS, authorizationRoles.manger),
  managerGetUsersController
);
router.get(
  '/orders',
  isAuth,
  customRoles(environmentConfig.MANGER_EMAILS, authorizationRoles.manger),
  managerGetOrdersController
);
router.get(
  '/feed/posts',
  isAuth,
  customRoles(environmentConfig.MANGER_EMAILS, authorizationRoles.manger),
  postPaginationMiddleware(),
  managerGetPostsController
);
export = router;
