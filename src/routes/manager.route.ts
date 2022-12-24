import express from 'express';
import { environmentConfig } from '@src/configs';
import { managerGetUsersController } from '@src/controllers';
import { customRoles, isAuth } from '@src/middlewares';

const router = express.Router();

router.get('/users', isAuth, customRoles(environmentConfig.MANGER_EMAILS), managerGetUsersController);

export = router;
