import express from 'express';

import { isAuth } from '@src/middlewares';
import {
  clearOrdersController,
  getInvoicesController,
  getOrdersController,
  postOrderController,
} from '@src/controllers/order.controller';

const router = express.Router();

router.get('/', isAuth, getOrdersController);
router.post('/', isAuth, postOrderController);
router.delete('/clear-orders', isAuth, clearOrdersController);
router.get('/invoices/:orderId', isAuth, getInvoicesController);

export = router;
