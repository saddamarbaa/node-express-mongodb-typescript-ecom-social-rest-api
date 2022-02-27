const express = require('express');
const router = express.Router();

const productController = require('../controllers/products.controller');

/**
 * @api {get}  /api/v1/products
 * @apiName Get Products
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiSuccess (200) {Object} mixed `Products` object
 */

router.get('/', productController.getProductsController);

// // Handling individual Request to /api/v1/products
// router.get('/:productId', productsController.products_get_one_product);

// // Handling updating individual /api/v1/products
// router.patch('/:productId', isAuth, productsController.products_update_product);

// // Handling deleting individual product
// router.delete('/:productId', isAuth, productsController.products_delete_product);

module.exports = router;
