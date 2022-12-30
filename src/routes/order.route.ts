import express from 'express';

import { isAuth, processingOrderValidation } from '@src/middlewares';
import {
  clearAllOrdersController,
  clearSingleOrdersController,
  getInvoicesController,
  getOrdersController,
  postOrderController,
} from '@src/controllers/order.controller';

const router = express.Router();

router.get('/', isAuth, getOrdersController);
router.post('/', isAuth, processingOrderValidation, postOrderController);
router.delete('/clear-orders', isAuth, clearAllOrdersController);
router.delete('/:orderId', isAuth, clearSingleOrdersController);
router.get('/invoices/:orderId', isAuth, getInvoicesController);

export = router;
