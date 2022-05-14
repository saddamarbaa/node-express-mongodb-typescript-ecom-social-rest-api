const express = require('express');

const { isAuth } = require('../middlewares/auth/checkIsAuth');

const ordersController = require('../controllers/orders.controller');

const router = express.Router();

/**
 * @api {get}  /api/v1/orders
 * @apiName Get Products
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiSuccess (200) {Object} mixed `Products` object
 */

router.get('/', isAuth, ordersController.getOrdersController);

/**
 * @api  {Post}  /api/v1/orders
 * @apiName add product to order list
 * @apiPermission Private
 * @apiGroup User
 *
 * @apiSuccess (200) {Object} mixed `product` object
 */
router.post('/', isAuth, ordersController.postOrderController);

/**
 * @api  {delete}   /api/v1/orders/clear-orders
 * @apiName  Clear orders list
 * @apiPermission Private
 * @apiGroup User
 *
 * @apiSuccess (200)
 */

router.delete('/clear-orders', isAuth, ordersController.clearOrdersController);

module.exports = router;
