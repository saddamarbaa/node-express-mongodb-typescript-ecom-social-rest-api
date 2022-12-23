import express from 'express';
import { productsPaginationMiddleware } from '@src/middlewares';
import { getProductController, getProductsController } from '@src/controllers';

const router = express.Router();

router.get('/', productsPaginationMiddleware(), getProductsController);
router.get('/:productId', getProductController);

export = router;
