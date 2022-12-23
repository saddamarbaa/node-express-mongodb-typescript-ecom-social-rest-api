import express from 'express';

import { isAdmin, isAuth } from '@src/middlewares';
import { managerGetUsersController } from '@src/controllers';

const router = express.Router();

router.get('/users', isAuth, isAdmin, managerGetUsersController);

export = router;
