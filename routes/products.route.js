const express = require('express');

const { isAuth } = require('../middlewares/auth/checkIsAuth');
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
 * @api  {Post}  /api/v1/products/cart
 * @apiName add product to cart
 * @apiPermission Private
 * @apiGroup User
 *
 * @apiParam  {String} [productId] productId
 * @apiSuccess (201) {Object} mixed `product` object
 */
router.post('/cart', isAuth, productValidation.validateID, productController.postAddToCartController);

/**
 * @api  {Post}  /api/v1/products/cart-delete-item
 * @apiName  remove item from cart
 * @apiPermission Private
 * @apiGroup User
 *
 * @apiParam  {String} [productId] productId
 * @apiSuccess (201) {Object} mixed `product` object
 */
router.post(
  '/cart-delete-item',
  isAuth,
  productValidation.validateID,
  productController.postCartDeleteProductController
);

/**
 * @api  {delete}   /api/v1/products/cart-delete-item
 * @apiName  Clear cart
 * @apiPermission Private
 * @apiGroup User
 *
 * @apiSuccess (200)
 */

router.delete('/clear-cart', isAuth, productController.clearCartController);

/**
 * @api  {get}  /api/v1/products/cart
 * @apiName Get user cart
 * @apiPermission Private
 * @apiGroup User
 *
 * @apiSuccess (200) {Object} mixed `product` user cart object
 */

router.get('/cart', isAuth, productController.getCartController);

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
