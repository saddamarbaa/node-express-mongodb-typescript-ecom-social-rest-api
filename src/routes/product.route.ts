import express from 'express';
import { isAuth, productsPaginationMiddleware, reviewProductValidation } from '@src/middlewares';
import {
  addReviewController,
  deleteReviewController,
  getProductController,
  getProductsController,
  getReviewsController,
} from '@src/controllers';

const router = express.Router();

router.get('/', productsPaginationMiddleware(), getProductsController);
router.get('/:productId', getProductController);
router.put('/reviews', isAuth, reviewProductValidation, addReviewController);

router.route('/reviews/:productId').delete(isAuth, deleteReviewController).get(getReviewsController);

export = router;
