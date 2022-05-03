const express = require('express');

const ProductModel = require('../models/products.model');
const productController = require('../controllers/products.controller');

const paginationMiddleware = require('../middlewares/sort-filter-pagination/productsFeatures.middleware');

const router = express.Router();

/**
 * @api {get}  /api/v1/products
 * @apiName Get Products
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiSuccess (200) {Object} mixed `Products` object
 */

router.get('/', paginationMiddleware(ProductModel), productController.getProductsController);

// // Handling individual Request to /api/v1/products
// router.get('/:productId', productsController.products_get_one_product);

// // Handling updating individual /api/v1/products
// router.patch('/:productId', isAuth, productsController.products_update_product);

// // Handling deleting individual product
// router.delete('/:productId', isAuth, productsController.products_delete_product);

module.exports = router;
