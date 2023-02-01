import express from 'express';

import {
  isAuth,
  productsPaginationMiddleware,
  reviewProductValidation,
  top5AliasProductsMiddleware,
} from '@src/middlewares';
import {
  addReviewController,
  deleteReviewController,
  getProductController,
  getProductsController,
  getReviewsController,
} from '@src/controllers';

const router = express.Router();

router.get('/', productsPaginationMiddleware(), getProductsController);
router.get('/top-5-cheap', top5AliasProductsMiddleware(), productsPaginationMiddleware(), getProductsController);
router.get('/:productId', getProductController);
router.put('/reviews', isAuth, reviewProductValidation, addReviewController);
router.get('/:productId', getProductController);
router.put('/reviews', isAuth, reviewProductValidation, addReviewController);

router.route('/reviews/:productId').delete(isAuth, deleteReviewController).get(getReviewsController);

export = router;
