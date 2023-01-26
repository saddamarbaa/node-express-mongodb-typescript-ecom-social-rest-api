import express from 'express';

import { environmentConfig } from '@src/configs';
import { moderatorGetUsersController } from '@src/controllers/moderator.controller';
import { customRoles, isAuth } from '@src/middlewares';
import { authorizationRoles } from '@src/constants';

const router = express.Router();

router.get(
  '/users',
  isAuth,
  customRoles(environmentConfig.MODERATOR_EMAILS, authorizationRoles.moderator),
  moderatorGetUsersController
);

export = router;
