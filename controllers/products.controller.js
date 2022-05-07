const productServices = require('../services/product.service');

exports.getProductsController = async (req, res, next) => {
  try {
    const getProductsService = await productServices.getProducts(req, res, next);
    return res.status(getProductsService.status).send(getProductsService);
  } catch (error) {
    return next(error);
  }
};

exports.getProductController = async (req, res, next) => {
  try {
    const getProductService = await productServices.getProduct(req, res, next);
    return res.status(getProductService.status).send(getProductService);
  } catch (error) {
    return next(error);
  }
};

exports.postAddToCartController = async (req, res, next) => {
  try {
    const postAddToCartService = await productServices.postAddToCart(req, res, next);
    return res.status(postAddToCartService.status).send(postAddToCartService);
  } catch (error) {
    return next(error);
  }
};

exports.getCartController = async (req, res, next) => {
  try {
    const getCartService = await productServices.getCart(req, res, next);
    return res.status(getCartService.status).send(getCartService);
  } catch (error) {
    return next(error);
  }
};

exports.postCartDeleteProductController = async (req, res, next) => {
  try {
    const postCartDeleteProductService = await productServices.postCartDeleteProduct(req, res, next);
    return res.status(postCartDeleteProductService.status).send(postCartDeleteProductService);
  } catch (error) {
    return next(error);
  }
};

exports.clearCartController = async (req, res, next) => {
  try {
    const clearCartService = await productServices.clearCart(req, res, next);
    return res.status(clearCartService.status).send(clearCartService);
  } catch (error) {
    return next(error);
  }
};
