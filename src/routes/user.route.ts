import express from 'express';

import { followUserController, unFollowUserController } from '@src/controllers';
import { isAuth, updateUserValidation } from '@src/middlewares';

const router = express.Router();

router.put('/:userId/follow', isAuth, updateUserValidation, followUserController);

router.put('/:userId/un-follow', isAuth, updateUserValidation, unFollowUserController);

export = router;
