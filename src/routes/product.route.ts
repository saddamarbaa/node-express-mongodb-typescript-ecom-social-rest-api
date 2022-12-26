import express from 'express';
import { isAuth, productsPaginationMiddleware, reviewProductValidation } from '@src/middlewares';
import { addReviewServiceCartController, getProductController, getProductsController } from '@src/controllers';

const router = express.Router();

router.get('/', productsPaginationMiddleware(), getProductsController);
router.get('/:productId', getProductController);
router.put('/reviews', isAuth, reviewProductValidation, addReviewServiceCartController);
export = router;
