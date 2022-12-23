import express from 'express';
import { isAuth } from '@src/middlewares';
import {
  addProductToCartController,
  clearCartController,
  deleteProductFromCartController,
  getCartController,
} from '@src/controllers';

const router = express.Router();

router.get('/', isAuth, getCartController);
router.post('/', isAuth, addProductToCartController);
router.delete('/clear-cart', isAuth, clearCartController);
router.post('/delete-item', isAuth, deleteProductFromCartController);

export = router;
