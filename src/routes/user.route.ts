import express from 'express';

import {
  blockUserController,
  followUserController,
  unBlockUserController,
  unFollowUserController,
  whoViewedMyProfileController,
} from '@src/controllers';
import { isAuth, updateUserValidation } from '@src/middlewares';

const router = express.Router();

router.put('/:userId/follow', isAuth, updateUserValidation, followUserController);

router.put('/:userId/un-follow', isAuth, updateUserValidation, unFollowUserController);
router.put('/:userId/view-profile', isAuth, updateUserValidation, whoViewedMyProfileController);
router.put('/:userId/block', isAuth, updateUserValidation, blockUserController);
router.put('/:userId/unblock', isAuth, updateUserValidation, unBlockUserController);

export = router;
