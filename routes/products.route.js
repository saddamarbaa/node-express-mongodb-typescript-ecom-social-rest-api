const express = require('express');

const ProductModel = require('../models/products.model');
const productController = require('../controllers/products.controller');
const productValidation = require('../middlewares/validate-request-schema/auth.validation');
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

/**
 * @api  {get}  /api/v1/products/productId
 * @apiName Get product
 * @apiPermission Public
 * @apiGroup User
 *
 * @apiParam  {String} [productId] productId
 * @apiSuccess (200) {Object} mixed `product` object
 */

router.get('/:productId', productValidation.validateID, productController.getProductController);

module.exports = router;
