const express = require('express');
const router = express.Router();

// Import Middleware function to authenticate token From different file
const { isAuth } = require('../middlewares/auth/checkIsAuth');

const ordersController = require('../controllers/orders.controller');

// Handling Get Request to /api/v1/orders
router.get('/', isAuth, ordersController.orders_get_all);

// Handling Post Request to /api/v1/orders
router.post('/', isAuth, ordersController.orders_create_order);

// Handling individual Request to /api/v1/orders
router.get('/:orderId', isAuth, ordersController.orders_get_one_order);

// Handling deleting individual /api/v1/orders
router.delete('/:orderId', isAuth, ordersController.orders_delete_order);

module.exports = router;
