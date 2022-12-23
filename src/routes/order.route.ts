import express from 'express';

import { isAuth } from '@src/middlewares';
import { clearOrdersController, getOrdersController, postOrderController } from '@src/controllers/order.controller';

const router = express.Router();

router.get('/', isAuth, getOrdersController);
router.post('/', isAuth, postOrderController);
router.delete('/clear-orders', isAuth, clearOrdersController);
export = router;
