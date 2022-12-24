import express from 'express';

import { environmentConfig } from '@src/configs';
import { moderatorGetUsersController } from '@src/controllers/moderator.controller';
import { customRoles, isAuth } from '@src/middlewares';

const router = express.Router();

router.get('/users', isAuth, customRoles(environmentConfig.MODERATOR_EMAILS), moderatorGetUsersController);

export = router;
